/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Public Layout & Views
import PublicLayout from './components/PublicLayout';
import Home from './features/home/Home';
import Catalog from './features/cars/Catalog';
import Detail from './features/cars/Detail';
import Articles from './features/articles/Articles';
import ArticleDetail from './features/articles/ArticleDetail';
import About from './features/about/About';
import Contact from './features/contact/Contact';

// Admin Security Layout & Views
import AdminLayout from './features/admin/AdminLayout';
import Login from './features/admin/Login';
import Dashboard from './features/admin/Dashboard';
import CarsList from './features/admin/CarsList';
import CarFormPage from './features/admin/CarFormPage';
import LeadsList from './features/admin/LeadsList';
import ArticlesList from './features/admin/ArticlesList';
import ArticleFormPage from './features/admin/ArticleFormPage';
import BusinessProfilePage from './features/admin/BusinessProfilePage';
import SettingsPage from './features/admin/SettingsPage';
import CuratorsList from './features/admin/CuratorsList';
import Insights from './features/admin/Insights';
import ContentSectionsPage from './features/admin/ContentSectionsPage'; // 🆕 addendum 09
import MediaLibraryPage from './features/admin/MediaLibraryPage'; // 🆕 addendum 09
import BackupPage from './features/admin/BackupPage'; // 🆕 addendum 09
import AuditLogsPage from './features/admin/AuditLogsPage'; // 🆕 addendum 09

// Services
import { trackingService } from './services/tracking.service';
import { carsService } from './services/cars.service';

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(location.search);

      const src = hashParams.get('src') || urlParams.get('src') ||
                  hashParams.get('utm_source') || urlParams.get('utm_source') ||
                  hashParams.get('ref') || urlParams.get('ref');

      if (src) {
        const cleanSource = src.toLowerCase().trim();
        sessionStorage.setItem('suhumobil_ref_source', cleanSource);

        const pathParts = location.pathname.split('/');
        const isCarDetail = pathParts[1] === 'cars' && pathParts[2];

        if (isCarDetail) {
          const carSlug = pathParts[2];
          carsService.getCarBySlug(carSlug)
            .then(res => {
              if (res.success && res.data) {
                const carId = res.data.id;
                sessionStorage.setItem('suhumobil_ref_car_id', carId);
                trackingService.registerVisit(carId, cleanSource);
              } else {
                trackingService.registerVisit(undefined, cleanSource);
              }
            })
            .catch(() => {
              trackingService.registerVisit(undefined, cleanSource);
            });
        } else {
          trackingService.registerVisit(undefined, cleanSource);
        }
      }
    } catch (err) {
      console.error('Error tracking visit:', err);
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        {/* PUBLIC WEBPAGE INTERFACES */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="cars" element={<Catalog />} />
          <Route path="cars/:slug" element={<Detail />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* SECURE ADMINISTRATIVE CHANNELS */}
        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          {/* Default redirect to administrative overview */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Cars catalog management */}
          <Route path="cars" element={<CarsList />} />
          <Route path="cars/new" element={<CarFormPage />} />
          <Route path="cars/:id/edit" element={<CarFormPage />} />

          {/* Leads CRM management */}
          <Route path="leads" element={<LeadsList />} />

          {/* Articles blog management */}
          <Route path="articles" element={<ArticlesList />} />
          <Route path="articles/new" element={<ArticleFormPage />} />
          <Route path="articles/:id/edit" element={<ArticleFormPage />} />

          {/* Brand profiles & Watermark controls */}
          <Route path="business-profile" element={<BusinessProfilePage />} />
          <Route path="curators" element={<CuratorsList />} />
          <Route path="insights" element={<Insights />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* 🆕 addendum 09 — CMS, Media Library, Backup, Audit Log */}
          <Route path="content" element={<ContentSectionsPage />} />
          <Route path="media" element={<MediaLibraryPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Fallback to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
