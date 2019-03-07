# TODO

* Attachments
* Delete issues
* Filters
  * UI prefs in local storage
  * Saving filters
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

# Major pieces

* Dashboard view
  * Figure out what content to put there.
  * Summary of issues: open / closed / etc.
  * Some sort of sparkline or graph.
* Issue Compose
  * Attachments
  * Milestones
* Issue Delete
* Issue Query
  * By Owner
* Label Delete
* GitHub integration
* Progress View
* Email Verification
* Project Settings
  * Milestones
  * Templates
  * Workflow
* Client unit tests (coverage)
* Enable Twitter auth
* Export / backup database
* Redis

# Components

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

# GitHub integration

* Ideally we shouldn't limit it to just GitHub. It should be pluggable.
* API-wise, it looks like this:

  * endpoint to receive hooks.
  * Collection to store plugin configuration.
  * database collection to store current scm status
    * scm provider
    * issue id
    * id of commit
    * url of commit page
    * status
      * pending
      * merged
      * closed

  * Setting up hooks:
    * The client won't have knowledge of specific hooks.
    * So it has to request a url from the backend.
    * Also needs a place to enter a secret.

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
