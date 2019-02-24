# TODO

* Component that displays relative date by day? Also grouping.
* Workflow actions (test)
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
* Ability to embed attachments in markdown
* Sorting by custom fields
* UI options stored in local storage.
* @mentions
* Markdown preview
* ErrorDisplay
  * Mini display for errors in menus and chips

# Major pieces

* Dashboard view
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

# Frontend compilation tests:

  "apollo-cache-inmemory": "^1.4.2",
  "apollo-link": "^1.2.6",
  "apollo-link-context": "^1.0.12",
  "apollo-link-error": "^1.1.5",
  "apollo-utilities": "^1.1.2",
  "axios": "^0.18.0",
  "copy-to-clipboard": "^3.0.8",
  "dateformat": "^3.0.3",
  "graphql": "^14.1.1",
  "graphql-subscriptions": "^1.0.0",
  "graphql-tag": "^2.10.1",
  "marked": "^0.6.0",
  "mobx": "^5.9.0",
  "mobx-react": "^5.4.3",
  "mobx-react-lite": "^1.0.1",
  "polished": "^2.3.3",
  "qs": "^6.6.0",
  "react-overlays": "^1.1.1",
  "react-router": "^4.3.1",
  "react-router-dom": "^4.3.1",
  "react-toastify": "^4.5.2",
  "react-transition-group": "^2.5.3",
