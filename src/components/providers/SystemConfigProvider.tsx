'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';

export interface SystemConfig {
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  enableRegistration: boolean;
  enableCourseReviews: boolean;
  enablePublicAPI: boolean;
}

const defaultConfig: SystemConfig = {
  platformName: 'EmberQuest',
  supportEmail: 'support@emberquest.in',
  contactPhone: '',
  enableRegistration: true,
  enableCourseReviews: true,
  enablePublicAPI: false,
};

const SystemConfigContext = createContext<{ config: SystemConfig; isLoading: boolean }>({
  config: defaultConfig,
  isLoading: true,
});

export const useSystemConfig = () => useContext(SystemConfigContext);

export const SystemConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiClient.get('/system/config');
        if (res.data?.success) {
          setConfig(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch system config', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <SystemConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </SystemConfigContext.Provider>
  );
};
