/**
 * Firebase Type Definitions
 * Voice Unheard - SDG 16 Social Injustice Reporting App
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  role: UserRole;
  createdAt: Timestamp;
  lastActive?: Timestamp;
  reportsCount: number;
}

export interface CreateUserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
  role: UserRole;
  reportsCount: number;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export type ReportCategory = 'corruption' | 'abuse' | 'discrimination' | 'violence' | 'other';
export type ReportStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'resolved';
export type ReportVisibility = 'private' | 'public';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  location?: string;
  locationCoords?: {
    latitude: number;
    longitude: number;
  };
  authorId: string;
  isAnonymous: boolean;
  status: ReportStatus;
  visibility: ReportVisibility;
  upvotes: number;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verifiedAt?: Timestamp | null;
  moderatorId?: string | null;
  moderatorNotes?: string;
  mediaUrls?: string[];
  tags?: string[];
}

export interface CreateReportData {
  title: string;
  description: string;
  category: ReportCategory;
  location?: string;
  locationCoords?: {
    latitude: number;
    longitude: number;
  };
  isAnonymous?: boolean;
  mediaUrls?: string[];
  tags?: string[];
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  category?: ReportCategory;
  location?: string;
  locationCoords?: {
    latitude: number;
    longitude: number;
  };
  mediaUrls?: string[];
  tags?: string[];
}

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export type ResourceCategory = 'legal_rights' | 'safety' | 'reporting_guide' | 'support' | 'general';
export type ResourceType = 'article' | 'video' | 'guide' | 'external_link' | 'hotline';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  content?: string;
  url?: string;
  thumbnailUrl?: string;
  language: string;
  isPublished: boolean;
  priority: number;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
}

// ============================================================================
// VOTE TYPES
// ============================================================================

export type VoteType = 'upvote' | 'support';

export interface ReportVote {
  userId: string;
  reportId: string;
  voteType: VoteType;
  createdAt: Timestamp;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export type AuditAction = 'status_change' | 'report_delete' | 'user_ban' | 'resource_publish';
export type AuditResourceType = 'report' | 'user' | 'resource';

export interface AuditLog {
  id: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  moderatorId: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  lastDoc?: any;
}
