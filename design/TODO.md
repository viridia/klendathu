# TODO

* Attachments
* Milestones
  * Compose view
  * Column
  * Progress
  * Number of issues
  * Delete
* Delete issues
* Centralize graphql queries and mutations
* Workflow actions (test)
  * Server unit test for removeLinks
* GraphQL Batching
* Better loading indicator
* Syntax highlighting for code examples.
* "Dark mode".
* Preserve issue navigation list between page refreshes.
* Better error reporting in issue create and issue edit.
* Ability to embed inline attachments in markdown
* UI options stored in local storage.
* @mentions
* Markdown preview
* Sort issue searches by relevance
* Filters
  * UI prefs in local storage (like expansion)
* ErrorDisplay
  * Mini display for errors in menus and chips
* Issue list flashes when switching projects.
* Idea: a global mobx time observer, which can be used to keep relative dates up to date.
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

# Major pieces

* Cron job
* Issue Compose
  * Attachments
  * Milestones
* Issue Delete
* Issue Query
  * By Owner
* Label Delete
* Email Verification
* Project Settings
  * Milestones
  * Templates
  * Workflow
* Client unit tests (coverage)
* Enable Twitter auth
* Export / backup database
* Redis

# Controls

* HelpBlocks for forms (CreateProject dialog)
* Dropdown (non-button)
* Spinner
* Switch
* Loading indicator

# Cleanups / Technical Debt

* Error boundaries
* Get rid of explicit passing of ViewContext where possible.
* Write Jest tests for all frontend components
* Define Mongo table references in one place.
* Move client queries and mutations to /graphql directory.

# Issue Models

Issue List State:

* Filter Params
* Column Order / Column Prefs
* Template
* Sort Order
* Pagination
* Whether or not we're fetching sub-issues and displaying a tree.

* Pagination:
  * There's a conflict between loading a single page of items, and wanting to do forward/back
    in the details view.
  * What would be ideal is a way to do the forward/back navigation on the server side.

# Templates

* The hardest part is template scoping.
  * We want templates to be sharable
  * We want to be able to extend existing templates
  * However, users need to be able to create their own private templates
  * Mapping from templates to projects is not 1:1
  * Thus, we have to manage a separate space of templates
  * OK so every account has a "default" template
    * Accounts can create additional templates or edit the default
    * Templates can extend, which includes all of the issue types and states
