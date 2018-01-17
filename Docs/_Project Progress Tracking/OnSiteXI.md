# OnSiteXI


### Work Order Updates

- CrewNo. Replaces WONo. for KN.

- SE WESLACO: WO’s replace WONo. With Mileage

 - Weslaco Techs log unit numbers, notes and mileage for SESA Trucks

 - Perhaps add diagnostic checklist for all units serviced here in Weslaco

- Work Report Entry is customizable by client: this allows for a cleaner UI (only relevant fields are displayed…)

### Add incomplete Reports tab

- reports without Unit No., or WO No. are persisted until completed (this does not affect hours for payroll, since the report exists -only that the user will know that it is still incomplete)

### Add Manager Mode

- Schedule summary, detail view, summary and detail per site;

- We can add other features as well -suggestions?

- We need to define all features before we can determine timelines and such.

### Add Timesheet Capture and storage

- Halliburton sites: Techs can capture/upload timesheets

### Badges: awards

- Badges and awards to show up on user home-screen (increase morale, allow
 managers to give awards for outstanding accomplishments… lots of ideas)

- Primary Badge (Tech Class) displayed on Home Screen

### Batch work-order entry mode

- Add multiple WO's, Units, Notes, time on one screen

- Perhaps set this as “Advanced Mode” Option

- Entire shift can be entered on a single screen much like the old website

- Not limited to 9 WO’s/Units

- “+” button to add additional WO for that day

- Entire Shift can also be edited with the same UI (where work order number or other details might need to be added later…)

- Can set hours for a repeated task for several units

- Ex: 6 units with the same task performed, time set for the entire group

- Time is divided by unit (this works out better, since individual reports are limited to 30 minute increments and a short task repeated for several units might only require 15-20 minutes per vehicle).

### Enhanced Profile

- Add avatar or image,

- Edit phone number,

- Edit Address,

- Edit Preferences…

### In-app Messaging

Msg other techs, managers, site-mates etc. Useful to reply to mgmt. msgs, report
safety issues, request sick day…

Messaging extended to OnSiteConsoleXI:

- Automatic Groups –Worksite groups are automatically generated from schedule,

- Msg to individual or group

- Typical chat interface:

- Txt msgs at first;

- Full MMS TBD;

- History and DB TBD…

- Again, we need to do a little research and define this module’s parameters
 before determining timeline.

### Missed Hours and Reimbursements

- Reports for missed hours: include fields for number of hours, dates of
 missed hours, description, … reimbursements: description, Date, amount,
 image capture of receipt… other fields TBD

### Payroll summary detailed

- add deductions and estimated take-home pay instead of just raw hours (on Home Screen –Payroll Period summary)

### Check-stub summary tab

- Shows actual payroll detail after payroll is run (export summary report from QuickBooks); this way the techs shouldn't need to come to the office to copy pay stubs

- Details for deductions etc. can be configured in OnSiteConsoleXI

- Possibly some configurations editable by employee (synced to DB)

- Exportable report for manually updating QuickBooks on changes from Employee

- Need to see export options from QB to see how this will be uploaded from the
 console…

- Feasibility TBD

### Log Shift Requirement

I’d like to revisit this; although it is another to-be-enforced requirement for the technicians

- Logging a shift sets the user active for a specific shift

- Setting a shift to active can also take a geolocation reading at time of
 activation

- Better Payroll tracking (we know if a tech is missing a report, or if they
 didn’t work)

- Optional log start and end of shift for better shift time tracking

### Performance optimizations

- App queries current and previous payroll period DB's plus incomplete reports DB(s) other optimizations to improve performance... Reports DB by week: create a new reports DB for each payroll period. DB name is "reports" + excel payroll period date number; ex: reports43068

### Preferences stored per user, online

- Update how user preferences are stored and retrieved; editable fields etc. This needs a bit of an overhaul for consistency and accuracy across the app and console

### Stats page

- Awards/badges, time-in-service, consecutive days worked, hours worked by week/month/year… perhaps some other statistics that the techs might like to see

### UI Themes

- Dark/Light, perhaps color options as well; themes for OnSite UI

### Update home screen UI

- change shift summary look/feel for better summary

- font and UI update

### Update Reports UI

- cleaner UI; eliminate unused UI elements; change some graphics; improve look
 and responsiveness

- converts start/end times to account for this break in the day

- KN units DB completion for Units/Crew Number (auto-complete option)

- KN unit number verification with DB

- Prefixed Units (HP-, BL-, TR-,…) prefix can be selected and just the number needs to be added

 - Toggle or some such UI for numerical unit number, or prefixed to see prefix options…

### Vacation/Time off Requests

- Add Time Off request page; track vacation/time off requests through App and Console *Time Off* Approval/Denial + manager comments viewable; resubmit/Date change suggestions can be tracked

### Update geolocation functionality and discussion

Realities of current work environment:

- Phone usage is discouraged at many sites and "app" usage even if legitimate may be suspect by client.

- Compliance enforcement is also an issue.

- Currently we are still only in the 95%-98% in getting reports in before payroll.

 - It is fruitless to add another requirement which can be ignored...

- Currently: Geoloc is superfluous. Techs typically do not access the app during shift hours

- Geo-stamping can only happen when the app is accessed.

- If App is used at the hotel, then only the current city is known (not whether or not the technician was at a worksite).

- It is not legal to *force* geotracking on personal devices (could only be enforced on company issued devices...)

 - We need voluntary compliance

- Possible options: require image capture of UnitNo: geostamp is recorded on unit.

- Alternately, WorkOrder image capture with geostamp...

 - We should still clear this with the clients so that our techs are not
  hassled for using their phone

- Clear this with clients so that they understand the reason and purpose of
 photographing the unit numbers

Usefulness of geotagging is not in question

- Automatic Travel Reports

- WorkSite Verification

- Tech Location Verification

- Shift Verification

Voluntary compliance is the only legal way to gather this data without issuing mobile devices or a legally vetted employment contract which explicitly state geotagging requirements and compliance and usage guidelines.
