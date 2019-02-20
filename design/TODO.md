# TODO

* Timeline
  * Comments display
  * Smart updating of timeline cache
* Workflow actions
* Attachments
* Make user links local to the view
* Batching
* ErrorDisplay
  * Show network errors
  * Mini display for errors in menus and chips
* Better UI for entering linked issues
* Sort issue searches by relevance
* Project timeline
* Better loading indicator
* Navbar project list
* Make Markdown a separate component.
* Comments should be joined to change entries so we can paginate them together.
* Syntax highlighting for code examples.
* "Dark mode".
* compiled template stuff.

# Major pieces

* Dashboard view
* Issue Compose
  * Attachments
  * Milestones
* Issue Details
  * Add workflow actions
  * Add assign to me
  * Add comment editings
  * Add comment display
* Issue Delete
* Issue Edit
* Issue Query
  * By Owner
* Label Delete
* Filters
* Mass Edit
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
* Coalesce timeline entries.
* Enable Twitter auth
* Enable issue grouping
* Export / backup database
* Redis

# Components

* DiscloseButton
* HelpBlocks for forms (CreateProject dialog)
* Table
  * SortOrder
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

