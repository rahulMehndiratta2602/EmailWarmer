export enum TaskType {
  MARK_IMPORTANT = 'mark_important',
  MOVE_FROM_SPAM = 'move_from_spam',
  STAR_EMAIL = 'star_email',
  OPEN_EMAIL = 'open_email',
  REPLY_EMAIL = 'reply_email',
  ARCHIVE_EMAIL = 'archive_email',
  LABEL_MANAGEMENT = 'label_management',
  SEARCH_INTERACTION = 'search_interaction',
  FOLDER_ORGANIZATION = 'folder_organization',
  CONTACT_ADDITION = 'contact_addition',
  DRAFT_CREATION = 'draft_creation',
  FILTER_CREATION = 'filter_creation',
  SETTINGS_ADJUSTMENT = 'settings_adjustment',
  ATTACHMENT_HANDLING = 'attachment_handling',
  LINK_CLICKING = 'link_clicking'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
} 