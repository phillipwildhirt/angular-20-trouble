/**
 * Save State enum.
 *
 * Add as many states as are needed for any of the SavingState_ Components.
 */
export enum SaveState {
  none,
  unsavedChanges,
  saving,
  saved,
  error,
  customError,
  unsavedInvalidChanges,
  unsavedValidChanges,
}
