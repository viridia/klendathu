# TODO

* Bug in expansion of mass edit
* Bug in search by summary
* Bug in changing mass edit op
* Workflow actions (test)
  * Unit test for removeLinks
  * Clone: target new issue
  * Create Linked: target new issue
  * Workflow inputs: return to apply dialog.
* Custom Props columns
  * Column edit.
* Attachments
* Delete issues
* Filters
  * Filter by custom fields
  * UI prefs in local storage
  * Saving filters
* GraphQL Batching
* Better UI for entering linked issues - current process is cumbersome.
* Project timeline
* Better loading indicator
* Syntax highlighting for code examples.
* "Dark mode".
* Template inheritance.
* Timeline
  * Show days in right column.
  * Should allow supression of change entries.
* Make user links local to the view
* Sort issue searches by relevance
* Preserve issue navigation list between page refreshes.
* Better error reporting in issue create and issue edit.
* Ability to embed inline attachments in markdown
* Sorting by custom fields
* UI options stored in local storage.
* @mentions
* Markdown preview
* ErrorDisplay
  * Mini display for errors in menus and chips
* Issue list flashes when switching projects.
* Idea: a global mobx time observer, which can be used to keep relative dates up to date.
* Idea: if a change entry has *no* effect, then remove it from the timeline.
* Be smarter about updating the graphql subscription cache for timeline updates.
* Use coverage reports to improve server unit tests.

# Major pieces

* Dashboard view
  * Figure out what content to put there.
  * Summary of issues: open / closed / etc.
  * Some sort of sparkline or graph.
* Issue Compose
  * Attachments
  * Milestones
* Issue Details
  * Add workflow actions
* Issue Delete
* Issue Query
  * By Owner
* Label Delete
* GitHub integration
* Progress View
* Changes View
* Email Verification
* Projects list in nav
* Project Settings
  * Columns
  * Members
  * Milestones
  * Templates
  * Workflow
* Client unit tests
* Enable Twitter auth
* Enable issue grouping
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
* Hot reloading with MobX?
* Define Mongo table references in one place.

# Issue Models

Issue List State:

* Filter Params
* Column Order / Column Prefs
* Template
* Sort Order
* Pagination
* Whether or not we're fetching sub-issues and displaying a tree.

* I don't want to build the column list every time we do a refresh.
* So the column list has to be passed in from above.

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
