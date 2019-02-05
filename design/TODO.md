# TODO

* GraphQL subscriptions
* GraphQL fragments
* Make user links local to the view
* Redis

# Components

* AutoComplete
* DiscloseButton
* HelpBlocks for forms (CreateProject dialog)
* Table
  * Header
  * SortOrder
  * Checkbox Column
* Dropdown (non-button)
* NavContainer (query param support)
* Spinner
* Switch

# Algorithm for filtering project subscriptions:

When a project is added, we want to notify all users:

  * who are members of the same organization
  * the user who created the project (this could be done without subs)

  Idea: channel per organization? (Channel per account, but we don't listen to most)

When any membership is added, removed or changed, notify that user.
