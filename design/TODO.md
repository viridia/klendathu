# TODO

* Milestones
  * Progress
  * Number of issues
  * Delete
* Reachability graph
* Autocomplete for custom field values
* Edit comment
* Redo screenshots in README
* Issue Child items
* Delete issues
* Centralize graphql queries and mutations (partly done)
* Workflow actions (test)
  * Server unit test for removeLinks
* GraphQL Batching
* Better loading indicator
* Syntax highlighting for code examples.
* "Dark mode" theme.
* Preserve issue navigation list between page refreshes.
* Better error reporting in issue create and issue edit.
* Ability to embed inline attachments in markdown
* UI options stored in local storage.
* @mentions
* Markdown preview
* Sort issue searches by relevance
* Filters
  * UI prefs in local storage (like filter expansion)
* ErrorDisplay
  * Mini display for errors in menus and chips
* Issue list flashes when switching projects.
* Idea: a global mobx time observer, which can be used to keep relative dates up to date.
  * mobx-utils has this.
* Idea: if a change entry has *no* effect, then remove it from the timeline.
* Be smarter about updating the graphql subscription cache for timeline updates.
* Use coverage reports to improve server unit tests.
* Timeline
  * Should allow supression of change entries (just comments).
* Better UI for entering linked issues - current process is cumbersome.
* Template inheritance.
* Make user links local to the view
* Make subscription payloads more consistent - always use 'value' and publish helper.
* Membership pages flashes on updates.
* Warn when navigating away on unsaved changes.
* When grouping issues, make table columns the same width.
* GitHub - handled closed commits. (just delete)
* Commits - check user role.
* Webhooks: finish 'edit' and 'remove'.
* Progress View
  * No need to show issue owner if that is the group type.
* Show attachments full size (media viewer)
* Search by relative date (last 2 weeks)
* Issue Grouping by custom field.
* Dashboard time line.
* Idea: implicit operations via comments.
  * examples:
    :blocked by #2
    :blocks #5
    :part of #6
    :has part #7
    :duplicate #8
    :related #9

# Major pieces

* Cron job
* Issue Delete
* Issue Query
  * By Time
* Label Delete
* Email Verification
* Project Settings
  * Templates
  * Workflow
* Client unit tests (coverage)
* Enable Twitter auth
* Export / backup database
* Redis

# Controls

* HelpBlocks for forms (CreateProject dialog) - Skyhook
* Spinner
* Loading indicator

# Cleanups / Technical Debt

* Error boundaries
* Get rid of explicit passing of ViewContext where possible.
* Write Jest tests for all frontend components
* Move client queries and mutations to /graphql directory.
* Redis: dynamically create topic names based on the subscription args. (performance)

# Issue Models

Issue List State:

* Filter Params
* Template
* Sort Order
* Pagination
* Whether or not we're fetching sub-issues and displaying a tree.

* Pagination:
  * There's a conflict between loading a single page of items, and wanting to do forward/back
    in the details view.
  * What would be ideal is a way to do the forward/back navigation on the server side.

# Shared Templates

* The hardest part is template scoping.
  * We want templates to be sharable
  * We want to be able to extend existing templates
  * However, users need to be able to create their own private templates
  * Mapping from templates to projects is not 1:1
  * Thus, we have to manage a separate space of templates
  * OK so every account has a "default" template
    * Accounts can create additional templates or edit the default
    * Templates can extend, which includes all of the issue types and states

# Notification preferences

* Email notification preferences:
  * What issues should generate a notification?
    * All issues
    * Only issues where I am mentioned (owner, reporter or CC)
    * Issues containing any of the following labels:

  * What kinds of changes should generate a notification:
    * Any change
    * Only changes to issue test (summary, description, comments)

  * How often should I be notified:
    * Immediately when there is a change.
    * No more than once per hour (summary digest)
    * No more than once per day (summary digest)

  * How should I be notified:
    * Email

## Algorithm:

- for each user:
  - for each project:
    - retrieve the last date that we sent a notification.
    - query the project timeline for all changes after that
    - filter the timeline by notification preferences.
    - generate an email from the timeline
    - update the datestamp

Note: It might be better to do this as a separate process. (eventually)

What happens if the worker crashes?
What happens if there are multiple workers?
