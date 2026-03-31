import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf, faUser, faChevronDown, faChevronRight,
  faCar, faRobot, faFlask, faRoute, faHome,
} from '@fortawesome/free-solid-svg-icons';
import SidebarSearch from '../SidebarSearch/SidebarSearch';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import { AV_NAV } from '../av/avData';
import { SP_NAV } from '../sp/spData';
import { TRAVEL_NAV } from '../travel/travelData';
import { HOUSEHOLD_NAV } from '../household/householdData';
import { DEMOGRAPHICS_NAV } from '../demographics/demographicsData';
import './Sidebar.css';

interface Cluster {
  id: string;
  label: string;
  path: string;
}

const ATTITUDES_CLUSTERS: Cluster[] = [
  { id: 'environmental',  label: 'Environmental Attitudes',  path: '/attitudes/environmental' },
  { id: 'residential',    label: 'Residential Preferences',  path: '/attitudes/residential' },
  { id: 'personality',    label: 'Personality & Social Comfort',          path: '/attitudes/personality' },
  { id: 'technology',     label: 'Technology Savviness & Connectivity',    path: '/attitudes/technology' },
  { id: 'transportation', label: 'General Transportation Attitudes',       path: '/attitudes/transportation' },
  { id: 'driving',        label: 'Driving & Car Ownership',                path: '/attitudes/driving' },
  { id: 'time',           label: 'Time Sensitivity',                       path: '/attitudes/time' },
];

const RH_ITEMS: Cluster[] = [
  { id: 'ridehailing-attitudes', label: 'Attitudes',                   path: '/mobility/ridehailing-attitudes' },
  { id: 'ridehailing-usage',     label: 'Usage Context (Trip Details)', path: '/mobility/ridehailing-usage' },
  { id: 'ridehailing-spending',  label: 'Monthly Expenditures',        path: '/mobility/ridehailing-spending' },
  { id: 'ridehailing-impact',    label: 'Impact on Other Modes',       path: '/mobility/ridehailing-impact' },
];

const BES_ITEMS: Cluster[] = [
  { id: 'bikescooter-trips',       label: 'Last Trip Details',        path: '/mobility/bikescooter-trips' },
  { id: 'bikescooter-reasons',     label: 'Reasons for Using Service', path: '/mobility/bikescooter-reasons' },
  { id: 'bikescooter-alternative', label: 'Alternative Mode',         path: '/mobility/bikescooter-alternative' },
];


const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentCluster } = useCurrentCluster();

  const isAttitudesRoute = location.pathname.startsWith('/attitudes');
  const isMobilityRoute  = location.pathname.startsWith('/mobility');
  const isAvRoute        = location.pathname.startsWith('/av');
  const isSpRoute        = location.pathname.startsWith('/sp');
  const isTravelRoute      = location.pathname.startsWith('/travel');
  const isHouseholdRoute     = location.pathname.startsWith('/household');
  const isDemographicsRoute  = location.pathname.startsWith('/demographics');

  // Top-level open state — purely derived from active route.
  const attitudesOpen = isAttitudesRoute;
  const mobilityOpen  = isMobilityRoute;
  const avOpen        = isAvRoute;
  const spOpen        = isSpRoute;
  const travelOpen      = isTravelRoute;
  const householdOpen      = isHouseholdRoute;
  const demographicsOpen   = isDemographicsRoute;

  // Sub-group open state — purely derived from active cluster.
  const rhIds = new Set(RH_ITEMS.map(i => i.id));
  const besIds = new Set(BES_ITEMS.map(i => i.id));
  const rhHasActive  = isMobilityRoute && rhIds.has(currentCluster);
  const besHasActive = isMobilityRoute && besIds.has(currentCluster);
  const rhOpen  = rhHasActive;
  const besOpen = besHasActive;

  return (
    <div className="sidebar">
      <SidebarSearch />

      {/* Section 1: Attitudes & Preferences */}
      <div className="sidebar-section">
        <div
          className={`section-header ${attitudesOpen ? 'open' : ''}`}
          onClick={() => {
            if (isAttitudesRoute) return; // active section — locked open
            navigate(ATTITUDES_CLUSTERS[0].path);
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faLeaf} className="section-icon" />
            <span className="section-title">General Attitudes &amp; Preferences</span>
          </div>
          <FontAwesomeIcon
            icon={attitudesOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {attitudesOpen && (
          <div className="section-topics">
            {ATTITUDES_CLUSTERS.map(cluster => {
              const isActive = isAttitudesRoute && currentCluster === cluster.id;
              return (
                <div
                  key={cluster.id}
                  className={`topic-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(cluster.path)}
                >
                  {cluster.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Mobility on Demand */}
      <div className="sidebar-section">
        <div
          className={`section-header ${mobilityOpen ? 'open' : ''}`}
          onClick={() => {
            if (isMobilityRoute) return; // active section — locked open
            navigate('/mobility/familiarity');
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faCar} className="section-icon" />
            <span className="section-title">Mobility on Demand</span>
          </div>
          <FontAwesomeIcon
            icon={mobilityOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {mobilityOpen && (
          <div className="section-topics">
            {/* Familiarity & Adoption — top-level item */}
            <div
              className={`topic-link ${isMobilityRoute && currentCluster === 'familiarity' ? 'active' : ''}`}
              onClick={() => navigate('/mobility/familiarity')}
            >
              Familiarity &amp; Adoption
            </div>

            {/* Ridehailing Services sub-group */}
            <div
              className={`mob-subgroup-header ${rhHasActive ? 'has-active' : ''}`}
              onClick={() => {
                if (rhHasActive) return; // already active — do nothing
                navigate(RH_ITEMS[0].path);
              }}
            >
              <span>Ridehailing Services</span>
              <FontAwesomeIcon
                icon={rhOpen ? faChevronDown : faChevronRight}
                className="mob-subgroup-chevron"
              />
            </div>
            {rhOpen && RH_ITEMS.map(item => (
              <div
                key={item.id}
                className={`topic-link topic-link-nested ${isMobilityRoute && currentCluster === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </div>
            ))}

            {/* Bike/Scooter Sharing sub-group */}
            <div
              className={`mob-subgroup-header ${besHasActive ? 'has-active' : ''}`}
              onClick={() => {
                if (besHasActive) return; // already active — do nothing
                navigate(BES_ITEMS[0].path);
              }}
            >
              <span>Bike/Scooter Sharing Services</span>
              <FontAwesomeIcon
                icon={besOpen ? faChevronDown : faChevronRight}
                className="mob-subgroup-chevron"
              />
            </div>
            {besOpen && BES_ITEMS.map(item => (
              <div
                key={item.id}
                className={`topic-link topic-link-nested ${isMobilityRoute && currentCluster === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Autonomous Vehicles */}
      <div className="sidebar-section">
        <div
          className={`section-header ${avOpen ? 'open' : ''}`}
          onClick={() => {
            if (isAvRoute) return; // active section — locked open
            navigate(AV_NAV[0].path);
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faRobot} className="section-icon" />
            <span className="section-title">Autonomous Vehicles</span>
          </div>
          <FontAwesomeIcon
            icon={avOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {avOpen && (
          <div className="section-topics">
            {AV_NAV.map(item => {
              const isActive = isAvRoute && currentCluster === item.id;
              return (
                <div
                  key={item.id}
                  className={`topic-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Stated Preference Experiments */}
      <div className="sidebar-section">
        <div
          className={`section-header ${spOpen ? 'open' : ''}`}
          onClick={() => {
            if (isSpRoute) return; // active section — locked open
            navigate(SP_NAV[0].path);
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faFlask} className="section-icon" />
            <span className="section-title">Stated Preference Experiments</span>
          </div>
          <FontAwesomeIcon
            icon={spOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {spOpen && (
          <div className="section-topics">
            {SP_NAV.map(item => {
              const isActive = isSpRoute && currentCluster === item.id;
              return (
                <div
                  key={item.id}
                  className={`topic-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 5: Current Travel Patterns */}
      <div className="sidebar-section">
        <div
          className={`section-header ${travelOpen ? 'open' : ''}`}
          onClick={() => {
            if (isTravelRoute) return;
            navigate(TRAVEL_NAV[0].path);
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faRoute} className="section-icon" />
            <span className="section-title">Current Travel Patterns</span>
          </div>
          <FontAwesomeIcon
            icon={travelOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {travelOpen && (
          <div className="section-topics">
            {TRAVEL_NAV.map(item => {
              const isActive = isTravelRoute && currentCluster === item.id;
              return (
                <div
                  key={item.id}
                  className={`topic-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 6: Household Vehicles & Residential Preferences */}
      <div className="sidebar-section">
        <div
          className={`section-header ${householdOpen ? 'open' : ''}`}
          onClick={() => {
            if (isHouseholdRoute) return;
            navigate(HOUSEHOLD_NAV[0].path);
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faHome} className="section-icon" />
            <span className="section-title">Household Vehicles &amp; Residential</span>
          </div>
          <FontAwesomeIcon
            icon={householdOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {householdOpen && (
          <div className="section-topics">
            {HOUSEHOLD_NAV.map(item => {
              const isActive = isHouseholdRoute && currentCluster === item.id;
              return (
                <div
                  key={item.id}
                  className={`topic-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 7: Demographics */}
      <div className="sidebar-section">
        <div
          className={`section-header ${demographicsOpen ? 'open' : ''}`}
          onClick={() => {
            if (isDemographicsRoute) return;
            navigate(DEMOGRAPHICS_NAV[0].path);
          }}
        >
          <div className="section-header-left">
            <FontAwesomeIcon icon={faUser} className="section-icon" />
            <span className="section-title">Demographics</span>
          </div>
          <FontAwesomeIcon
            icon={demographicsOpen ? faChevronDown : faChevronRight}
            className="chevron-icon"
          />
        </div>

        {demographicsOpen && (
          <div className="section-topics">
            {DEMOGRAPHICS_NAV.map(item => {
              const isActive = isDemographicsRoute && currentCluster === item.id;
              return (
                <div
                  key={item.id}
                  className={`topic-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
