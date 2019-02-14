# TODO

* compiled template stuff.
* Create shared models which are more efficient than Query component.
* Make user links local to the view
* Redis

# Components

* DiscloseButton
* HelpBlocks for forms (CreateProject dialog)
* Table
  * SortOrder
* Dropdown (non-button)
* NavContainer (query param support)
* Spinner
* Switch

# Issue Models

Issue List State:

* Filter Params
* Column Order / Column Prefs
* Template
* Sort Order
* Pagination
* Selection
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

