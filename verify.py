#!/usr/bin/env python3
"""
verify.py — Cross-check every dashboard variable against the raw CSV.
Replicates the exact computation logic from dataLoader.ts and each page component.

Usage:
    python3 verify.py > verification_output.txt
"""

import csv
import math
import os
from collections import defaultdict

CSV_PATH = 'public/data/t4_survey_data.csv'

# ── Skip value sets (mirroring dataLoader.ts) ──────────────────────────────────
# computeLikertCounts: only skips MISSING = 'Seen but not answered'
LIKERT_SKIP = {'Seen but not answered'}

# computeDistribution / computeGenericCounts / computeSelectionRate: full SKIP_VALUES
SKIP_VALUES = {
    'Seen but not answered',
    'Appropriate skip',
    'Missing (other)',
    'Appropriate skip - Would never buy the AV',
}

# HouseholdPage / TravelPage / DemographicsPage local SKIP_SET (no AV-specific skip)
SKIP_SET = {'Seen but not answered', 'Appropriate skip', 'Missing (other)'}


# ── CSV loader ─────────────────────────────────────────────────────────────────
def load_csv(path):
    rows = []
    with open(path, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


# ── Compute helpers (mirror JS functions) ─────────────────────────────────────

def compute_likert_counts(data, variable):
    """Mirrors computeLikertCounts — skips only 'Seen but not answered'."""
    cats = ['Strongly disagree', 'Somewhat disagree', 'Neutral', 'Somewhat agree', 'Strongly agree']
    counts = {c: 0 for c in cats}
    total = 0
    for row in data:
        v = row.get(variable, '')
        if not v or v in LIKERT_SKIP:
            continue
        total += 1
        if v in counts:
            counts[v] += 1
    return counts, total


def compute_distribution(data, variable):
    """Mirrors computeDistribution — skips all SKIP_VALUES."""
    counts = defaultdict(int)
    for row in data:
        v = row.get(variable, '')
        if not v or v in SKIP_VALUES:
            continue
        counts[v] += 1
    return dict(counts)


def compute_generic_counts(data, variable, categories):
    """Mirrors computeGenericCounts — skips SKIP_VALUES, only counts predefined cats."""
    counts = {c: 0 for c in categories}
    total = 0
    for row in data:
        v = row.get(variable, '')
        if not v or v in SKIP_VALUES:
            continue
        if v in counts:
            counts[v] += 1
            total += 1
    return counts, total


def compute_selection_rate(data, variable, selected_value):
    """Mirrors computeSelectionRate — skips SKIP_VALUES."""
    selected = 0
    total = 0
    for row in data:
        v = row.get(variable, '')
        if not v or v in SKIP_VALUES:
            continue
        total += 1
        if v == selected_value:
            selected += 1
    return selected, total


def compute_capped_counts(data, variable, cats, cap_at):
    """Mirrors computeCappedCounts (HouseholdPage/DemographicsPage) — skips SKIP_SET."""
    counts = {c: 0 for c in cats}
    total = 0
    for row in data:
        v = row.get(variable, '')
        if not v or v in SKIP_SET:
            continue
        try:
            n = int(v)
        except ValueError:
            continue
        total += 1
        key = f'{cap_at}+' if n >= cap_at else str(n)
        if key in counts:
            counts[key] += 1
    return counts, total


def bin_numeric(data, variable, bins):
    """Mirrors binNumeric — skips SKIP_SET, bins by float value. Bins are [min, max)."""
    counts = [0] * len(bins)
    total = 0
    for row in data:
        v = row.get(variable, '')
        if not v or v in SKIP_SET:
            continue
        try:
            n = float(v)
        except ValueError:
            continue
        total += 1
        for i, b in enumerate(bins):
            if b['min'] <= n < b['max']:
                counts[i] += 1
                break
    return counts, total


def compute_numeric_mean(data, variable, cap=50):
    """Mirrors computeNumericMean — skips SKIP_SET, caps values."""
    vals = []
    for row in data:
        v = row.get(variable, '')
        if not v or v in SKIP_SET:
            continue
        try:
            n = float(v)
        except ValueError:
            continue
        vals.append(min(n, cap))
    if not vals:
        return 0.0, 0
    return sum(vals) / len(vals), len(vals)


def pct(count, total):
    if total == 0:
        return 0.0
    return count / total * 100


# ── Report helpers ─────────────────────────────────────────────────────────────
total_checked = 0


def report_distribution(section, variable, data, cats=None, label_map=None, note=''):
    """Print percentage distribution for a categorical variable."""
    global total_checked
    dist = compute_distribution(data, variable)
    total = sum(dist.values())
    suffix = f' ({note})' if note else ''
    print(f"\n[{section}] {variable}{suffix}  N_valid={total}")
    if cats:
        for cat in cats:
            c = dist.get(cat, 0)
            p = pct(c, total)
            label = label_map.get(cat, cat) if label_map else cat
            print(f"  {label}: {c}/{total} = {p:.1f}%")
            total_checked += 1
        # Also print any unexpected values for investigation
        unknown = {k: v for k, v in dist.items() if k not in cats}
        if unknown:
            print(f"  [UNEXPECTED VALUES in CSV]: {unknown}")
    else:
        for label, c in sorted(dist.items(), key=lambda x: -x[1]):
            p = pct(c, total)
            print(f"  {label}: {c}/{total} = {p:.1f}%")
            total_checked += 1


def report_likert(section, variable, data):
    global total_checked
    counts, total = compute_likert_counts(data, variable)
    print(f"\n[{section}] {variable}  N_valid={total}")
    for label, c in counts.items():
        p = pct(c, total)
        print(f"  {label}: {c}/{total} = {p:.1f}%")
        total_checked += 1


def report_generic(section, variable, categories, data, note=''):
    global total_checked
    counts, total = compute_generic_counts(data, variable, categories)
    suffix = f' ({note})' if note else ''
    print(f"\n[{section}] {variable}{suffix}  N_valid={total}")
    for cat in categories:
        c = counts.get(cat, 0)
        p = pct(c, total)
        print(f"  {cat}: {c}/{total} = {p:.1f}%")
        total_checked += 1


def main():
    global total_checked

    print(f"Loading CSV: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV not found at {CSV_PATH}")
        return
    data = load_csv(CSV_PATH)
    N = len(data)
    print(f"Total rows: {N}")
    print("=" * 70)

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 1: General Attitudes & Preferences
    # computeLikertCounts: skips only 'Seen but not answered'
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 1: GENERAL ATTITUDES & PREFERENCES")
    print("=" * 70)

    cluster_vars = {
        'Environmental':    ['att_gastax', 'att_lesspol', 'att_environfriend'],
        'Residential':      ['att_mixuse', 'att_closetransit', 'att_spachome'],
        'Personality':      ['att_shopstore', 'att_onething', 'att_newanddif', 'att_uncomf'],
        'Technology':       ['att_firsttech', 'att_techfrus', 'att_intercon', 'att_sharperinfo'],
        'Transportation':   ['att_pubtrans', 'att_travrout', 'att_congest', 'att_alterdrive', 'att_motsick', 'att_carcrash'],
        'Driving':          ['att_carown', 'att_carquality', 'att_prefdriv', 'att_rentcar'],
        'Time Sensitivity': ['att_timeuse', 'att_transtime', 'att_busy', 'att_wait'],
    }
    for cluster, variables in cluster_vars.items():
        print(f"\n--- {cluster} ---")
        for var in variables:
            report_likert(f'S1-{cluster}', var, data)

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 2: Mobility on Demand
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 2: MOBILITY ON DEMAND")
    print("=" * 70)

    FAMILIARITY_CATS = [
        'I am not familiar with it',
        'I am familiar but never used the service',
        'I use it rarely (e.g., less than once a month)',
        'I use it monthly',
        'I use it weekly',
    ]
    print("\n--- Familiarity (computeGenericCounts) ---")
    for var in ['pvtridehailing_famil', 'shdridehailing_famil', 'carsharing_famil', 'bikesharing_famil', 'escooter_famil']:
        report_generic('S2-Familiarity', var, FAMILIARITY_CATS, data)

    print("\n--- RH Attitudes (Likert) ---")
    rh_att_vars = [
        'rh_att_expensive', 'rh_att_reliable', 'rh_att_savmonpark', 'rh_att_avimpaired',
        'rh_att_carunavail', 'rh_att_awayhome', 'rh_att_gettotransit', 'rh_att_transnotavl',
        'rh_att_fewcar', 'rh_att_drivuncomf', 'rh_att_shareuncomf', 'rh_att_sharecost',
        'rh_att_carseat', 'rh_att_ada', 'rh_att_homeloc',
    ]
    for var in rh_att_vars:
        report_likert('S2-RH-Att', var, data)

    print("\n--- RH Impact on Modes (computeGenericCounts) ---")
    CHANGE_CATEGORIES = [
        'I use it more often', 'I use it about the same',
        'I use it less often', 'I have changed usage, but not because of ridehailing',
    ]
    for var in ['rh_change_sov', 'rh_change_hovdriver', 'rh_change_hovpass', 'rh_change_bus',
                'rh_change_lightrail', 'rh_change_taxi', 'rh_change_bikescoot', 'rh_change_walk']:
        report_generic('S2-RH-Impact', var, CHANGE_CATEGORIES, data)

    print("\n--- RH Trip Details (computeDistribution) ---")
    RH_SERVICETYPE_CATS = ['Private ridehailing (e.g., Uber, Lyft)', 'Shared ridehailing (e.g., uberPOOL, Lyft Share)']
    report_distribution('S2-RH-Service', 'rh_servicetype', data, RH_SERVICETYPE_CATS)

    RH_TRIPTIME_CATS = ['Weekday daytime', 'Weeknight (excluding Friday night)', 'Weekend daytime', 'Weekend night time (including Friday night)']
    report_distribution('S2-RH-TripTime', 'rh_triptime', data, RH_TRIPTIME_CATS)

    RH_TRIPPURP_CATS = ['Main commute location', 'Going/returning home from another location', 'Social/recreational',
                        'Shopping/errands', 'Eating/drinking', 'To access airport', 'To access public transit', 'Medical/dental', 'Other']
    report_distribution('S2-RH-Purpose', 'rh_trippurp', data, RH_TRIPPURP_CATS)

    # Monthly expenditure — '$0 ' has trailing space in CSV per comment in mobilityData.ts
    RH_MONTHEXPEND_CATS = ['$0 ', '$1 - $9', '$10 - $29', '$30 - $49', '$50 - $74', '$75 - $100', 'More than $100']
    report_distribution('S2-RH-MonthExpend', 'rh_monthexpend', data, RH_MONTHEXPEND_CATS,
                        note="'$0 ' has trailing space in CSV; MobilityPage trims it for display")

    print("\n--- RH Companions (computeSelectionRate) ---")
    RH_COMPANION = [
        ('rh_travelalone',     'I was the only passenger'),
        ('rh_travelwhfriends', 'Family members, friends or colleagues'),
        # Note: 'hidehailing' typo in CSV selectedValue (not 'ridehailing')
        ('rh_travelwhshared',  'Other passengers matched via the app (for shared hidehailing)'),
    ]
    for var, sel in RH_COMPANION:
        selected, total = compute_selection_rate(data, var, sel)
        p = pct(selected, total)
        print(f"\n[S2-RH-Companions] {var}  N_valid={total}")
        print(f"  selected='{sel}'")
        print(f"  {selected}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- BES Trip Details (computeDistribution) ---")
    BES_SERVICETYPE_CATS = ['Bikesharing', 'E-scooter sharing']
    report_distribution('S2-BES-Service', 'bes_servicetype', data, BES_SERVICETYPE_CATS)

    BES_TRIPTIME_CATS = ['Weekday daytime', 'Weeknight (excluding Friday night)', 'Weekend daytime', 'Weekend night time (including Friday night)']
    report_distribution('S2-BES-TripTime', 'bes_triptime', data, BES_TRIPTIME_CATS)

    BES_TRIPLENGTH_CATS = ['Less than a mile', '1-2 miles', '3-4 miles', '5 miles or more']
    report_distribution('S2-BES-TripLen', 'bes_triplength', data, BES_TRIPLENGTH_CATS)

    BES_PURPOSE_CATS = [
        'CommuteLocation', 'Going/returning home from another location', 'Social/recreational',
        'Shopping/errands', 'Eating/drinking', 'Just to enjoy the ride/try the new service',
        'To access airport', 'To access public transit', 'Medical/dental', 'Other',
    ]
    report_distribution('S2-BES-Purpose', 'bes_purpose', data, BES_PURPOSE_CATS)

    print("\n--- BES Reasons (computeSelectionRate) ---")
    BES_REASONS = [
        ('bes_reas_nopark',    'No need to park/parking was expensive or scarce'),
        ('bes_reas_exerc',     'For more physical exercise'),
        ('bes_reas_savetime',  'To save time'),
        ('bes_reas_savemon',   'To save money'),
        ('bes_reas_ptnotavl',  'Public transit was not available'),
        ('bes_reas_ptnotconv', 'Public transit was not convenient'),
        ('bes_reas_vehnotavl', 'Private vehicle was not available'),
        ('bes_reas_joy',       'Just to enjoy the ride/try the new service'),
    ]
    for var, sel in BES_REASONS:
        selected, total = compute_selection_rate(data, var, sel)
        p = pct(selected, total)
        print(f"\n[S2-BES-Reasons] {var}  N_valid={total}")
        print(f"  {selected}/{total} = {p:.1f}%")
        total_checked += 1

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 3: Autonomous Vehicles
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 3: AUTONOMOUS VEHICLES")
    print("=" * 70)

    print("\n--- AV Familiarity (computeDistribution) ---")
    AV_FAMILIARITY_CATS = [
        'I had never heard of AVs before taking this survey.',
        "I have heard of AVs, but don't know much about them.",
        'I am somewhat familiar with AVs.',
        'I am very familiar with AVs.',
        'I have actually taken a ride in an AV.',
    ]
    AV_FAMILIARITY_SHORT = {
        'I had never heard of AVs before taking this survey.':   'Never heard of AVs',
        "I have heard of AVs, but don't know much about them.":  "Heard, don't know much",
        'I am somewhat familiar with AVs.':                       'Somewhat familiar',
        'I am very familiar with AVs.':                           'Very familiar',
        'I have actually taken a ride in an AV.':                 'Have ridden in one',
    }
    report_distribution('S3-AV-Familiarity', 'av_familiarity', data, AV_FAMILIARITY_CATS, AV_FAMILIARITY_SHORT)

    print("\n--- AV Purchase Intentions (computeDistribution) ---")
    AV_TIMEPURCHASE_CATS = [
        'I will be one of the first people to buy an AV.',
        'I will eventually buy an AV, but only after these vehicles are in common use.',
        'I will never buy an AV.',
    ]
    report_distribution('S3-AV-Purchase', 'av_timepurchase', data, AV_TIMEPURCHASE_CATS)

    print("\n--- AV Willingness to Pay (computeDistribution) ---")
    AV_WILLPAY_CATS = [
        'I would NOT be willing to pay any additional amount for the autonomous version of the vehicle',
        'Up to $1,000 more',
        'Between $1,000 and $3,000 more',
        'Between $3,000 and $5,000 more',
        'Between $5,000 and $8,000 more',
        'Greater than $8,000 more',
    ]
    report_distribution('S3-AV-WTP', 'av_willpay', data, AV_WILLPAY_CATS)

    print("\n--- General AV Attitudes (computeLikertCounts) ---")
    av_att_vars = [
        'av_att_avimpaired', 'av_att_joydriving', 'av_att_saferped', 'av_att_children',
        'av_att_equipfail', 'av_att_carstress', 'av_att_sleep', 'av_att_longdist',
        'av_att_dataleak', 'av_att_errands', 'av_att_neverride', 'av_att_takecontrol',
        'av_att_hhshare', 'av_att_savetime',
    ]
    for var in av_att_vars:
        report_likert('S3-AV-Att', var, data)

    print("\n--- Safety & Policy Attitudes (computeLikertCounts) ---")
    av_policy_vars = [
        'av_att_saferhuman', 'av_att_safepriorpedest', 'av_att_safepriorchoice',
        'av_att_speedlaw', 'av_att_liability', 'av_att_dedicatedlane',
    ]
    for var in av_policy_vars:
        report_likert('S3-AV-Policy', var, data)

    print("\n--- AV Ridehailing Attitudes (computeLikertCounts) ---")
    av_rh_vars = ['av_rh_privateride', 'av_rh_sharedride', 'av_rh_backupdriver', 'av_rh_lease']
    for var in av_rh_vars:
        report_likert('S3-AV-RH', var, data)

    print("\n--- Vehicle Ownership Change (computeDistribution) ---")
    AV_CHANGE_OWN_CATS = [
        'Likely own fewer cars than today',
        'Likely own the same number of cars as today',
        'Likely own more cars than today',
    ]
    report_distribution('S3-AV-VehOwn', 'av_change_hhcarown', data, AV_CHANGE_OWN_CATS)

    print("\n--- Mode Choice Impact (computeGenericCounts) ---")
    AV_MODECHANGE_CATS = ['Use Less', 'Use the Same', 'Use More']
    for var in ['av_change_privateveh', 'av_change_humrh', 'av_change_bus',
                'av_change_lightrail', 'av_change_walk', 'av_change_bikescoot', 'av_change_plane']:
        report_generic('S3-AV-ModeChange', var, AV_MODECHANGE_CATS, data)

    print("\n--- Commute Tolerance (computeDistribution) ---")
    AV_COMMUTE_CATS = [
        'I would not accept a longer commute even when I have access to an AV',
        'Up to 5 additional minutes (one way)',
        'Between 5 and 15 additional minutes (one way)',
        'Between 15 and 30 additional minutes (one way)',
        'More than 30 additional minutes (one way)',
    ]
    AV_COMMUTE_SHORT = {
        'I would not accept a longer commute even when I have access to an AV': 'No additional time',
        'Up to 5 additional minutes (one way)': 'Up to 5 min',
        'Between 5 and 15 additional minutes (one way)': '5-15 min',
        'Between 15 and 30 additional minutes (one way)': '15-30 min',
        'More than 30 additional minutes (one way)': '30+ min',
    }
    report_distribution('S3-AV-Commute', 'av_addcomtime', data, AV_COMMUTE_CATS, AV_COMMUTE_SHORT)

    print("\n--- Multitasking (computeSelectionRate, special denominators) ---")
    # av_multi_interpass: denominator = rows where value NOT in {'Appropriate skip','Seen but not answered'} AND not empty
    INTERPASS_SKIP = {'Appropriate skip', 'Seen but not answered'}
    interpass_eligible = sum(
        1 for row in data
        if row.get('av_multi_interpass', '') not in INTERPASS_SKIP
        and row.get('av_multi_interpass', '') != ''
    )
    default_total = N  # AVPage uses filteredData.length (= N when no filters)

    print(f"  av_multi_interpass eligible denominator: {interpass_eligible}")
    print(f"  default_total (data.length): {default_total}")

    AV_MULTI_VARIABLES = [
        ('av_multi_work',      'Work, or study'),
        ('av_multi_phone',     'Talk on the phone/ send or read text messages/teleconference'),
        ('av_multi_read',      'Read'),
        ('av_multi_sleep',     'Sleep'),
        ('av_multi_tv',        'Watch movies/ TV/ other entertainment'),
        ('av_multi_games',     'Play games'),
        ('av_multi_eatdrink',  'Eat and drink'),
        ('av_multi_interpass', 'Interact with other passengers'),
        ('av_multi_scenery',   'Enjoy the scenery'),
        ('av_multi_watchroad', 'Watch the road, even though I would not be driving'),
        ('av_multi_noav',      'I would not ride in an AV'),
    ]
    for var, sel_val in AV_MULTI_VARIABLES:
        selected, _ = compute_selection_rate(data, var, sel_val)
        denom = interpass_eligible if var == 'av_multi_interpass' else default_total
        p = pct(selected, denom)
        print(f"\n[S3-AV-Multi] {var}  selected={selected}  denom={denom}  {p:.1f}%")
        total_checked += 1

    print("\n--- Lifestyle Changes (computeGenericCounts) ---")
    AV_LIFESTYLE_CATS = ['Very unlikely', 'Somewhat unlikely', 'Neutral', 'Somewhat likely', 'Very likely']
    av_lifestyle_vars = [
        'av_change_makemoretrips', 'av_change_travfar_eatshop', 'av_change_travfar_social',
        'av_change_travaftdark', 'av_change_longdist', 'av_change_travpeakhr',
        'av_change_homeloc', 'av_change_wrkloc', 'av_change_congtol',
    ]
    for var in av_lifestyle_vars:
        report_generic('S3-AV-Lifestyle', var, AV_LIFESTYLE_CATS, data)

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 4: Stated Preference Experiments
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 4: STATED PREFERENCE EXPERIMENTS")
    print("=" * 70)

    print("\n--- SP1: Private vs. Shared (computeDistribution) ---")
    SP1_CATS = ['Option 1: Private ridehailing', 'Option 2: Shared ridehailing']
    SP1_SHORT = {'Option 1: Private ridehailing': 'Private ridehailing', 'Option 2: Shared ridehailing': 'Shared ridehailing'}
    for var in ['SP1_Scen1_Answer', 'SP1_Scen2_Answer', 'SP1_Scen3_Answer']:
        report_distribution('S4-SP1', var, data, SP1_CATS, SP1_SHORT)

    print("\n--- SP2: AV Purchase Ranking (computeGenericCounts) ---")
    SP2_RANK_CATS = ['1', '2', '3']
    for var in ['SP2_Scen1_Reg_Answer', 'SP2_Scen1_AV_Answer', 'SP2_Scen1_RH_Answer',
                'SP2_Scen2_Reg_Answer', 'SP2_Scen2_AV_Answer', 'SP2_Scen2_RH_Answer']:
        report_generic('S4-SP2', var, SP2_RANK_CATS, data)

    print("\n--- SP-Rank: 7-Mode Ranking (computeGenericCounts) ---")
    SP_RANK_CATS = ['1', '2', '3', '4', '5', '6', '7']
    for var in ['SP_Rank_Final_Car', 'SP_Rank_Final_Bike', 'SP_Rank_Final_Transit',
                'SP_Rank_Final_NoAV_Private', 'SP_Rank_Final_NoAV_Shared',
                'SP_Rank_Final_AV_Private', 'SP_Rank_Final_AV_Shared']:
        report_generic('S4-SP-Rank', var, SP_RANK_CATS, data)

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 5: Current Travel Patterns
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 5: CURRENT TRAVEL PATTERNS")
    print("=" * 70)

    print("\n--- Employment (computeDistribution) ---")
    EMPLOYMENT_CATS = [
        'A worker (part-time or full-time)', 'A student (part-time or full-time)',
        'Both a worker and a student', 'Neither a worker nor a student',
    ]
    EMPLOYMENT_SHORT = {
        'A worker (part-time or full-time)': 'Worker',
        'A student (part-time or full-time)': 'Student',
        'Both a worker and a student': 'Both worker & student',
        'Neither a worker nor a student': 'Neither',
    }
    report_distribution('S5-Employment', 'employment', data, EMPLOYMENT_CATS, EMPLOYMENT_SHORT)

    print("\n--- Commute Frequency (computeGenericCounts) ---")
    COMFREQ_CATS = ['0', '1', '2', '3', '4', '5', '6', '7']
    for var in ['com_daystowork', 'com_daystoschool', 'com_telecommute']:
        report_generic('S5-ComFreq', var, COMFREQ_CATS, data)

    print("\n--- Commute Distance (binNumeric) ---")
    DISTANCE_BINS = [
        {'label': '0 mi',     'min': 0,   'max': 0.1},
        {'label': '< 2 mi',   'min': 0.1, 'max': 2},
        {'label': '2-5 mi',   'min': 2,   'max': 5},
        {'label': '5-10 mi',  'min': 5,   'max': 10},
        {'label': '10-25 mi', 'min': 10,  'max': 25},
        {'label': '25-50 mi', 'min': 25,  'max': 50},
        {'label': '> 50 mi',  'min': 50,  'max': float('inf')},
    ]
    counts, total = bin_numeric(data, 'com_distance', DISTANCE_BINS)
    print(f"\n[S5-ComDist] com_distance  N_valid={total}")
    for i, b in enumerate(DISTANCE_BINS):
        p = pct(counts[i], total)
        print(f"  {b['label']}: {counts[i]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- Commute Time (binNumeric) ---")
    TIME_BINS = [
        {'label': '< 5 min',   'min': 0,  'max': 5},
        {'label': '5-10 min',  'min': 5,  'max': 10},
        {'label': '10-20 min', 'min': 10, 'max': 20},
        {'label': '20-30 min', 'min': 20, 'max': 30},
        {'label': '30-45 min', 'min': 30, 'max': 45},
        {'label': '45-60 min', 'min': 45, 'max': 60},
        {'label': '> 60 min',  'min': 60, 'max': float('inf')},
    ]
    counts, total = bin_numeric(data, 'com_time', TIME_BINS)
    print(f"\n[S5-ComTime] com_time  N_valid={total}")
    for i, b in enumerate(TIME_BINS):
        p = pct(counts[i], total)
        print(f"  {b['label']}: {counts[i]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- Primary Commute Mode (computeDistribution) ---")
    COM_MODE_CATS = [
        'Private vehicle, driving alone', 'Private vehicle, driving with passengers',
        'Private vehicle, riding with others', 'Carsharing services (e.g., Zipcar)',
        'Bus', 'Light rail', 'Uber/Lyft/other ridehailing services',
        'Bicycle (including bikesharing)', 'E-scooter sharing service (e.g., Bird, Lime)',
        'Walk', 'Other mode',
    ]
    COM_MODE_SHORT = {
        'Private vehicle, driving alone': 'Drive alone',
        'Private vehicle, driving with passengers': 'Drive w/ passengers',
        'Private vehicle, riding with others': 'Ride w/ others',
        'Carsharing services (e.g., Zipcar)': 'Carsharing',
        'Bus': 'Bus', 'Light rail': 'Light rail',
        'Uber/Lyft/other ridehailing services': 'Ridehailing',
        'Bicycle (including bikesharing)': 'Bike',
        'E-scooter sharing service (e.g., Bird, Lime)': 'E-scooter',
        'Walk': 'Walk',
        'Other mode': 'Other',
    }
    report_distribution('S5-ComMode', 'com_mode', data, COM_MODE_CATS, COM_MODE_SHORT)

    print("\n--- Commute Mode Frequency (computeGenericCounts) ---")
    MODEFREQ_CATS = [
        'Not available', 'Available but I never use it',
        'I use it less than one day a month', 'I use it 1-3 days a month',
        'I use it 1-2 days a week', 'I use it 3 or more days a week',
    ]
    for var in ['com_frq_sov', 'com_frq_hovdriver', 'com_frq_hovpass', 'com_frq_carshare',
                'com_frq_bus', 'com_frq_lightrail', 'com_frq_ridehailing', 'com_frq_taxi',
                'com_frq_bike', 'com_frq_escooter', 'com_frq_walk', 'com_frq_other']:
        report_generic('S5-ComModeFreq', var, MODEFREQ_CATS, data)

    print("\n--- Non-Commute Mode Frequency (computeGenericCounts) ---")
    for var in ['ncom_frq_sov', 'ncom_frq_hovdriver', 'ncom_frq_hovpass', 'ncom_frq_carshare',
                'ncom_frq_bus', 'ncom_frq_lightrail', 'ncom_frq_ridehailing', 'ncom_frq_taxi',
                'ncom_frq_bike', 'ncom_frq_escooter', 'ncom_frq_walk', 'ncom_frq_other']:
        report_generic('S5-NComModeFreq', var, MODEFREQ_CATS, data)

    print("\n--- Conditions Limiting Travel (computeGenericCounts) ---")
    CONDITIONS_CATS = ['Yes', 'To some extent', 'No']
    for var in ['cond_drivegeneral', 'cond_drivenight', 'cond_pubtransit', 'cond_bike', 'cond_walk']:
        report_generic('S5-Conditions', var, CONDITIONS_CATS, data)

    print("\n--- Average Miles Driven (computeDistribution) ---")
    MILES_CATS = [
        'Zero', '1-25 miles', '26-50 miles', '51-75 miles', '76-100 miles',
        '101-200 miles', '201-300 miles', '301-500 miles', 'More than 500 miles',
    ]
    MILES_SHORT = {
        'Zero': '0 mi', '1-25 miles': '1-25 mi', '26-50 miles': '26-50 mi',
        '51-75 miles': '51-75 mi', '76-100 miles': '76-100 mi', '101-200 miles': '101-200 mi',
        '201-300 miles': '201-300 mi', '301-500 miles': '301-500 mi', 'More than 500 miles': '> 500 mi',
    }
    report_distribution('S5-MilesDriven', 'avgmlsdriven', data, MILES_CATS, MILES_SHORT)

    print("\n--- Adults with Driving Limitations (computeDistribution) ---")
    report_distribution('S5-NoDrive', 'hh_adultnodrive', data, ['Yes', 'No'])

    print("\n--- Delivery Frequency (computeGenericCounts, note corrupted date strings) ---")
    # Excel date corruption: '3-Feb'='2-3', '6-Apr'='4-6', '10-Jul'='7-10'
    DELIVERY_CATS = ['0', '1', '3-Feb', '6-Apr', '10-Jul', '>10']
    for var in ['del_purchitem', 'del_prepmeal', 'del_grocery']:
        report_generic('S5-Delivery', var, DELIVERY_CATS, data)

    print("\n--- Long-Distance Travel (computeNumericMean, cap=50) ---")
    ld_vars = [
        ('ld_leisure_car',   'Leisure-Car'),
        ('ld_leisure_plane', 'Leisure-Plane'),
        ('ld_leisure_other', 'Leisure-Other'),
        ('ld_biz_car',       'Biz-Car'),
        ('ld_biz_plane',     'Biz-Plane'),
        ('ld_biz_other',     'Biz-Other'),
    ]
    for var, label in ld_vars:
        mean, n = compute_numeric_mean(data, var, cap=50)
        print(f"\n[S5-LD] {var} ({label}): mean={mean:.2f}  n={n}")
        total_checked += 1

    print("\n--- Airport Visits (computeDistribution) ---")
    report_distribution('S5-Airport', 'airportvisit', data, ['Yes', 'No'])

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 6: Household Vehicles & Residential Preferences
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 6: HOUSEHOLD VEHICLES & RESIDENTIAL PREFERENCES")
    print("=" * 70)

    print("\n--- Driver's License (computeDistribution) ---")
    report_distribution('S6-License', 'driver', data, ['Yes', 'No'])

    print("\n--- Household Vehicles (computeCappedCounts, cap=5) ---")
    HH_VEH_CATS = ['0', '1', '2', '3', '4', '5+']
    counts, total = compute_capped_counts(data, 'hh_veh', HH_VEH_CATS, 5)
    print(f"\n[S6-HHVeh] hh_veh  N_valid={total}")
    for cat in HH_VEH_CATS:
        p = pct(counts[cat], total)
        print(f"  {cat}: {counts[cat]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- Household Drivers (computeCappedCounts, cap=5) ---")
    HH_NDRIVERS_CATS = ['0', '1', '2', '3', '4', '5+']
    counts, total = compute_capped_counts(data, 'hh_ndrivers', HH_NDRIVERS_CATS, 5)
    print(f"\n[S6-HHDrivers] hh_ndrivers  N_valid={total}")
    for cat in HH_NDRIVERS_CATS:
        p = pct(counts[cat], total)
        print(f"  {cat}: {counts[cat]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- Vehicle Fuel Type (computeDistribution) ---")
    VEHICLE_FUEL_CATS = ['Gasoline', 'Hybrid', 'Electric', 'Other']
    report_distribution('S6-VehFuel', 'veh1_fuel', data, VEHICLE_FUEL_CATS)

    print("\n--- Vehicle Annual Miles (computeDistribution) ---")
    VEHICLE_MILES_CATS = [
        'Less than 5,000 miles', '5,000 to 9,999 miles', '10,000 to 14,999 miles',
        '15,000 to 19,999 miles', '20,000 to 24,999 miles', '25,000 to 29,999 miles',
        '30,000 to 39,999 miles', '40,000 and above',
    ]
    report_distribution('S6-VehMiles', 'veh1_miles', data, VEHICLE_MILES_CATS)

    print("\n--- Vehicle Model Year (binNumeric) ---")
    MODEL_YEAR_BINS = [
        {'label': 'Before 1990', 'min': 0,    'max': 1990},
        {'label': '1990-1999',   'min': 1990, 'max': 2000},
        {'label': '2000-2004',   'min': 2000, 'max': 2005},
        {'label': '2005-2009',   'min': 2005, 'max': 2010},
        {'label': '2010-2014',   'min': 2010, 'max': 2015},
        {'label': '2015-2019',   'min': 2015, 'max': 2020},
        {'label': '2020+',       'min': 2020, 'max': float('inf')},
    ]
    counts, total = bin_numeric(data, 'veh1_modyr', MODEL_YEAR_BINS)
    print(f"\n[S6-VehModYr] veh1_modyr  N_valid={total}")
    for i, b in enumerate(MODEL_YEAR_BINS):
        p = pct(counts[i], total)
        print(f"  {b['label']}: {counts[i]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- ADAS Features (computeSelectionRate) ---")
    ADAS_VARIABLES = [
        ('adas_backcam',   'Backup camera'),
        ('adas_abs',       'Automated braking system'),
        ('adas_acc',       'Adaptive Cruise Control (ACC)'),
        ('adas_blindspot', 'Blind spot monitoring'),
        ('adas_lanekeep',  'Lane keeping system'),
        ('adas_none',      'None'),
        ('adas_notsure',   'Not sure'),
    ]
    for var, sel_val in ADAS_VARIABLES:
        selected, total = compute_selection_rate(data, var, sel_val)
        p_has = pct(selected, total)
        p_not = pct(total - selected, total)
        print(f"\n[S6-ADAS] {var}  N_valid={total}")
        print(f"  Has feature ('{sel_val}'): {selected}/{total} = {p_has:.1f}%")
        print(f"  Does not have: {total-selected}/{total} = {p_not:.1f}%")
        total_checked += 2

    print("\n--- Housing Type (computeDistribution) ---")
    HOUSUNIT_VALUES = ['Stand-alone home', 'Attached home/townhome', 'Condo/apartment', 'Mobile home', 'Other']
    report_distribution('S6-HousUnit', 'housunit', data, HOUSUNIT_VALUES)

    print("\n--- Tenure (computeDistribution) ---")
    TENURE_CATS = ['Own', 'Rent', 'Provided by somebody else (e.g., relative, employer)', 'Other']
    TENURE_SHORT = {
        'Own': 'Own', 'Rent': 'Rent',
        'Provided by somebody else (e.g., relative, employer)': 'Provided by someone',
        'Other': 'Other',
    }
    report_distribution('S6-Tenure', 'tenure', data, TENURE_CATS, TENURE_SHORT)

    print("\n--- Year Moved (binNumeric) ---")
    HOME_YRMOVED_BINS = [
        {'label': 'Before 1980', 'min': 0,    'max': 1980},
        {'label': '1980-1989',   'min': 1980, 'max': 1990},
        {'label': '1990-1999',   'min': 1990, 'max': 2000},
        {'label': '2000-2004',   'min': 2000, 'max': 2005},
        {'label': '2005-2009',   'min': 2005, 'max': 2010},
        {'label': '2010-2014',   'min': 2010, 'max': 2015},
        {'label': '2015-2019',   'min': 2015, 'max': 2020},
        {'label': '2020+',       'min': 2020, 'max': float('inf')},
    ]
    counts, total = bin_numeric(data, 'home_yrmoved', HOME_YRMOVED_BINS)
    print(f"\n[S6-YrMoved] home_yrmoved  N_valid={total}")
    for i, b in enumerate(HOME_YRMOVED_BINS):
        p = pct(counts[i], total)
        print(f"  {b['label']}: {counts[i]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- Chose Home Location (computeDistribution) ---")
    report_distribution('S6-HomeChosen', 'home_chosen', data, ['Yes', 'No'])

    print("\n--- Home Location Preferences (computeGenericCounts) ---")
    HOMELOC_CATS = ['Do not want', 'Do not care', 'Want', 'Must have']
    HOMELOC_VARIABLES = [
        'homeloc_largehome', 'homeloc_backyard', 'homeloc_singlefam', 'homeloc_closework',
        'homeloc_closeshops', 'homeloc_closenature', 'homeloc_closefamfriend',
        'homeloc_goodschool', 'homeloc_walkbike', 'homeloc_transit', 'homeloc_lowcrime',
    ]
    for var in HOMELOC_VARIABLES:
        report_generic('S6-HomeLoc', var, HOMELOC_CATS, data)

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 7: Demographics
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("SECTION 7: DEMOGRAPHICS")
    print("=" * 70)

    print("\n--- Gender (computeDistribution) ---")
    GENDER_CATS = ['Female', 'Male', 'Other', 'Prefer not to answer']
    report_distribution('S7-Gender', 'gender', data, GENDER_CATS)

    print("\n--- Age Group (computeDistribution, preserved order) ---")
    AGEGROUP_CATS = ['18-30 years', '31-40 years', '41-50 years', '51-60 years', '61-70 years', '71+ years']
    report_distribution('S7-Age', 'AgeGroup1', data, AGEGROUP_CATS)

    print("\n--- Race (binary multi-select, SKIP_SET + 'Option not selected', total=N) ---")
    RACE_VARIABLES = [
        ('race_white',          'White'),
        ('race_black',          'Black or African American'),
        ('race_nativeamerican', 'Amer. Indian / Alaska Native'),
        ('race_asian',          'Asian'),
        ('race_other',          'Other race'),
        ('race_prefnotanswer',  'Prefer not to answer'),
    ]
    print(f"  total = N = {N}")
    for var, label in RACE_VARIABLES:
        selected = 0
        for row in data:
            val = row.get(var, '')
            if val and val not in SKIP_SET and val != 'Option not selected':
                selected += 1
        p = pct(selected, N)
        print(f"  {label} ({var}): {selected}/{N} = {p:.1f}%")
        total_checked += 1

    print("\n--- Ethnicity / Hispanic (computeDistribution) ---")
    report_distribution('S7-Hispanic', 'hispaniclatin', data)

    print("\n--- Place of Birth (computeDistribution) ---")
    report_distribution('S7-PlaceBirth', 'placebirth', data)

    print("\n--- Education (computeDistribution) ---")
    report_distribution('S7-Education', 'education', data)

    print("\n--- Household Size (computeCappedCounts, cap=7) ---")
    HH_SIZE_CATS = ['1', '2', '3', '4', '5', '6', '7+']
    counts, total = compute_capped_counts(data, 'hh_size', HH_SIZE_CATS, 7)
    print(f"\n[S7-HHSize] hh_size  N_valid={total}")
    for cat in HH_SIZE_CATS:
        p = pct(counts[cat], total)
        print(f"  {cat}: {counts[cat]}/{total} = {p:.1f}%")
        total_checked += 1

    print("\n--- Household Income (computeDistribution, field=IncomeImputation) ---")
    report_distribution('S7-Income', 'IncomeImputation', data)

    print("\n--- Housing Type (computeDistribution, reused from S6) ---")
    HOUSUNIT_VALUES = ['Stand-alone home', 'Attached home/townhome', 'Condo/apartment', 'Mobile home', 'Other']
    report_distribution('S7-HousUnit', 'housunit', data, HOUSUNIT_VALUES)

    print("\n--- Tenure (computeDistribution, reused from S6) ---")
    report_distribution('S7-Tenure', 'tenure', data, TENURE_CATS, TENURE_SHORT)

    print("\n--- Survey Institution (computeDistribution) ---")
    INSTITUTION_CATS = ['ASU', 'GT', 'USF', 'UT']
    INSTITUTION_LABELS = {
        'ASU': 'ASU (Phoenix)', 'GT': 'GT (Atlanta)',
        'USF': 'USF (Tampa)',   'UT': 'UT (Austin)',
    }
    report_distribution('S7-Institution', 'SurveyInstitution', data, INSTITUTION_CATS, INSTITUTION_LABELS)

    print("\n--- Home State (computeDistribution on HState2, mapped from FIPS) ---")
    FIPS_TO_STATE = {'4': 'Arizona', '12': 'Florida', '13': 'Georgia', '48': 'Texas'}
    state_dist = compute_distribution(data, 'HState2')
    state_total = sum(state_dist.values())
    print(f"\n[S7-State] HState2  N_valid={state_total}")
    print(f"  Raw unique values in CSV: {sorted(state_dist.keys())}")
    for fips, name in sorted(FIPS_TO_STATE.items()):
        c = state_dist.get(fips, 0)
        p = pct(c, state_total)
        print(f"  {name} (FIPS={fips}): {c}/{state_total} = {p:.1f}%")
        total_checked += 1

    # ═══════════════════════════════════════════════════════════════════════════
    # Summary
    # ═══════════════════════════════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print(f"TOTAL INDIVIDUAL VALUES CHECKED: {total_checked}")
    print("Verification complete.")
    print("=" * 70)


if __name__ == '__main__':
    main()
