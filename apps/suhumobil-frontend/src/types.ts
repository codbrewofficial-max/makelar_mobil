/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export enum CarStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED'
}

export enum CarTransmission {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT'
}

export enum CarFuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC'
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum LeadSource {
  WHATSAPP_CTA = 'WHATSAPP_CTA',
  WHATSAPP_FAB = 'WHATSAPP_FAB',
  DREAM_CAR_FORM = 'DREAM_CAR_FORM',
  CONTACT_PAGE = 'CONTACT_PAGE'
}

export enum LeadSubject {
  PRICE_INQUIRY = 'PRICE_INQUIRY',
  NEGOTIATION = 'NEGOTIATION',
  SCHEDULE_SURVEY = 'SCHEDULE_SURVEY',
  OTHER = 'OTHER'
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface InspectionItem {
  status: 'good' | 'minor' | 'bad';
  note: string;
}

export interface InspectionReport {
  mesin: InspectionItem;
  transmisi: InspectionItem;
  bodi: InspectionItem;
  interior: InspectionItem;
  kakiKaki: InspectionItem;
  kelistrikan: InspectionItem;
  catatanKhusus?: string;
  inspectedBy?: string;
  inspectedAt?: string;
}

export interface CarImage {
  id: string;
  carId: string;
  url: string;
  fileHash: string;
  sizeBytes: number;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface Car {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number; // BigInt represented as number in API response
  mileage: number;
  transmission: CarTransmission;
  fuelType: CarFuelType;
  color?: string;
  location: string;
  description: string;
  inspectionReport?: InspectionReport;
  status: CarStatus;
  createdBy: string;
  images: CarImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  city?: string;
  budget?: number;
  carInterest?: string;
  subject?: LeadSubject;
  message?: string;
  carId?: string;
  car?: Car; // Joined car relation if any
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  readingTimeMinutes: number;
  status: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Curator {
  id: string;
  name: string;
  photoUrl: string;
  description: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatermarkSettings {
  label: string;
  link: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export interface BusinessProfile {
  logoUrl?: string;
  name: string;
  tagline: string;
  description: string;
  address?: string;
  phone?: string;
}

export interface PublicSettings {
  siteTitle: string;
  whatsappNumber: string;
  socialLinks: SocialLinks;
  watermark: WatermarkSettings;
  businessProfile: BusinessProfile;
  gtmId?: string;
  ga4Id?: string;
}

export interface AdminSettings extends PublicSettings {
  storageQuotaGb: number;
}

export interface DashboardStats {
  totalCars: number;
  publishedCars: number;
  soldCars: number;
  totalLeads: number;
  newLeads: number;
  totalArticles: number;
  publishedArticles: number;
  storageUsedMb: number;
  storageQuotaMb: number;
}

export interface TrackingLog {
  id: string;
  type: 'visit' | 'click' | 'lead'; // visit = land on page with ref, click = clicked share/copy link, lead = converted
  source: string; // e.g. 'whatsapp', 'facebook', 'instagram', 'tiktok', 'telegram', 'custom'
  carId?: string;
  carTitle?: string;
  timestamp: string;
}

export interface SystemInsight {
  totalVisits: number;
  totalClicks: number;
  totalLeads: number;
  bySource: {
    source: string;
    visits: number;
    clicks: number;
    leads: number;
  }[];
  byCar: {
    carId: string;
    carTitle: string;
    visits: number;
    clicks: number;
  }[];
  recentLogs: TrackingLog[];
}

