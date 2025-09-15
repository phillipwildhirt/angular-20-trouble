export enum ToolTip {
  Delete = 1,
  Edit = 2,
  Duplicate = 3
}

export enum SectionState {
  pristine = 0,
  touched,
  hasValidChanges,
  hasInvalidChanges,
  saving,
  saved
}

export enum ComponentState {
  normal = 0,
  hover,
  pressed,
  focus,
  active
}

export enum MouseState {
  mouseenter = 'mouseenter',
  mouseleave = 'mouseleave',
  mousedown = 'mousedown',
  mouseup = 'mouseup'
}

export enum CellStyle {
  oneRowNoSubText = 0,
  oneRowNoSubTextSmall = 1,
  twoRowSubText = 2,
  twoRowNoSubText = 3,
  twoRowNoSubTextWithHeader = 4,
  threeRowSubText = 5,
  threeRowNoSubText = 6,
  threeRowNoSubTextWithHeader= 7
}

export enum CellFontStyle {
  normalText = 0,
  smallText = 1,
  smallAndMutedText = 2,
  includeHeaderNormalText = 4
}

export enum HeaderStyle {
  headerNoChildren = 0,
  headerOneChildWithSubText = 1,
  headerOneChildNoSubText = 2,
  headerTwoChildrenWithSubText = 3,
  headerTwoChildrenNoSubText = 4,
}

export enum NavMenuAnimationState {
  opened = 'opened',
  closed = 'closed',
  cancel = 'cancel'
}

export enum NumericFormat {
  includeDollarSign = 'D',
  includePercentSign = 'P',
  includeCommas= 'C'
}

export enum UploadStatus {
  uploading  = 0,
  success = 1,
  uploadingFail = 2,
  deletingFail = 3,
  none = 4,
  deleting,
}

export enum ItemType {
  style = 'Style',
  order = 'Order',
  submittal = 'Submittal',
  unknown = 'Select Item Type'
}

export enum SharedSearchBarLocations {
  messages        =   'messages',
  notifications   =    'notifications'
}

export enum MessagingSearchBarLocations {
  dashboardMessages = 'dashboard-messages',
  dashboardNotifications = 'dashboard-notifications',
  messagingMessages = 'messaging-messages',
  messagingNotifications = 'messaging-notifications',
  messagingResearch = 'messaging-research',
  messages = 'messages',
  research = 'research',
  sent = 'sent',
  notifications = 'notifications',
  none = '',
  messagingSent = 'messaging-sent',
}

export enum StyleCommentSearchBarLocations {
  styleComments = 'style-comments',
  styleMessages = 'style-messages',
  styleNotifications = 'style-notifications',
  messages = 'messages',
  comments = 'comments',
  notifications = 'notifications',
  none = '',
}

export enum SearchBarIds {
  messagingSearchBarInputId = 'search-bar-input-box-messaging',
  messagesSearchBarInputId = 'search-bar-input-box-messages',
  notificationsSearchBarInputId = 'search-bar-input-box-notifications',
  genericSearchBarInputId = 'search-bar-input-box',
  messagingSentSearchBarInputId = 'search-bar-input-box-messaging',
}

export enum BlotType {
  person = 0,
  item = 1,
  notification = 2,
  role = 3
}

export enum ThreadType {
  message = 0,
  notification = 1,
  research = 2
}

export enum ThreadConvertType {
  user = 'U',
  department = 'D',
  role = 'R'
}

export enum SnoozeOptionsType {
  today = 0,
  tomorrow = 1,
  nextWeek = 2,
  two_weeks = 3,
  reset = 4
}

export enum FileViewSize {
  thumbnail = 't',
  display = 'd',
  full = 'f'
}


