import dmz from '../content/dmz/course.json' with { type: 'json' };
import splunk from '../content/splunk/course.json' with { type: 'json' };
import mecm from '../content/enterprise/mecm.json' with { type: 'json' };
import wsus from '../content/enterprise/wsus.json' with { type: 'json' };
import landingZone from '../content/landing-zone/course.json' with { type: 'json' };
import security from '../content/security/course.json' with { type: 'json' };
import helpdesk from '../content/helpdesk/course.json' with { type: 'json' };
import maintenance from '../content/azure/maintenance.json' with { type: 'json' };
import {
  nessusCourses,
  nessusLessons,
  type NessusCourse,
} from './nessus-curriculum.ts';
export const dmzCourse = dmz as NessusCourse;
export const splunkCourse = splunk as NessusCourse;
export const mecmCourse = mecm as NessusCourse;
export const wsusCourse = wsus as NessusCourse;
export const landingZoneCourse = landingZone as NessusCourse;
export const maintenanceCourse = maintenance as NessusCourse;
export const helpdeskCourse = helpdesk as NessusCourse;
export const securityCourse = security as NessusCourse;
export const guidedCourses = [
  dmzCourse,
  splunkCourse,
  ...nessusCourses,
  maintenanceCourse,
  helpdeskCourse,
  securityCourse,
  landingZoneCourse,
  mecmCourse,
  wsusCourse,
];
export const guidedLessons = [
  ...dmzCourse.lessons,
  ...splunkCourse.lessons,
  ...nessusLessons,
  ...maintenanceCourse.lessons,
  ...helpdeskCourse.lessons,
  ...securityCourse.lessons,
  ...landingZoneCourse.lessons,
  ...mecmCourse.lessons,
  ...wsusCourse.lessons,
];
export const guidedCourseHref = (id: string) =>
  id === 'windows-dmz'
    ? '/dmz'
    : id === 'splunk-core-user'
      ? '/splunk'
      : id === 'mecm-operations'
        ? '/mecm'
        : id === 'wsus-operations'
          ? '/wsus'
          : id === 'azure-landing-zone'
            ? '/landing-zone'
            : id === 'budget-cloud-security'
              ? '/security'
              : id === 'iis-helpdesk'
                ? '/helpdesk'
                : id === 'azure-maintenance'
                  ? '/azure-operations'
                  : `/nessus/${id.replace('nessus-', '')}`;
