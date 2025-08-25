'use client'

import { useTranslation } from 'react-i18next'

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-red-600 text-white p-2 flex items-center justify-center">
      <span className="text-sm">
        {t('header.warning')}
      </span>
    </div>
  )
}