import { PageHeader } from '../components/PageHeader'
import { usePreferences } from '../i18n/preferencesContext'
import type { Language } from '../i18n/translations'

type ChangelogEntry = {
  date: string
  title: Record<Language, string>
  description: Record<Language, string>
  items: Record<Language, string[]>
}

const changelogEntries: ChangelogEntry[] = [
  {
    date: '2026-06-08',
    title: {
      id: 'Simulasi Angsuran ARJUNA',
      en: 'ARJUNA Installment Simulator',
    },
    description: {
      id: 'Menambahkan fitur simulasi angsuran dengan tampilan yang lebih mudah dipahami untuk user non-IT dan non-finance.',
      en: 'Added an installment simulation tool with a friendlier experience for non-IT and non-finance users.',
    },
    items: {
      id: [
        'Mendukung mode Anuitas - Effective Rate dan Anuitas - Flat Rate.',
        'Hasil simulasi muncul otomatis saat input diisi.',
        'Menampilkan ringkasan angsuran dan jadwal bunga, pokok, serta sisa pokok per bulan.',
      ],
      en: [
        'Supports Annuity - Effective Rate and Annuity - Flat Rate modes.',
        'Simulation results update automatically as users enter values.',
        'Shows installment summary plus monthly interest, principal, and remaining principal schedule.',
      ],
    },
  },
  {
    date: '2026-06-08',
    title: {
      id: 'Preferensi tampilan dan bahasa',
      en: 'Theme and language preferences',
    },
    description: {
      id: 'Portal kini terasa lebih personal dengan pilihan tema, bahasa, dan footer global yang lebih rapi.',
      en: 'The portal now feels more personal with theme preferences, language support, and a cleaner global footer.',
    },
    items: {
      id: [
        'Menambahkan mode gelap dan terang dengan penyimpanan preferensi di browser.',
        'Menambahkan pilihan bahasa Indonesia dan English.',
        'Menambahkan halaman Changelog untuk melihat riwayat update.',
      ],
      en: [
        'Added dark and light mode with browser-saved preferences.',
        'Added Indonesian and English language support.',
        'Added a Changelog page to track feature updates.',
      ],
    },
  },
  {
    date: '2026-06-06',
    title: {
      id: 'Review perubahan SQL sebelum download',
      en: 'SQL change review before download',
    },
    description: {
      id: 'SQL Deployment Formatter sekarang membantu membaca guideline SLRC dengan preview perubahan yang bisa direview lebih dulu.',
      en: 'SQL Deployment Formatter now helps apply SLRC guideline recommendations with a reviewable change preview.',
    },
    items: {
      id: [
        'Menambahkan usulan perbaikan guideline untuk beberapa pola SQL umum.',
        'Menambahkan tampilan diff unified dan side by side.',
        'Download diblokir sampai perubahan yang perlu direview disetujui atau ditolak.',
      ],
      en: [
        'Added guideline fix suggestions for common SQL patterns.',
        'Added unified and side-by-side diff views.',
        'Downloads are blocked until reviewable changes are accepted or rejected.',
      ],
    },
  },
  {
    date: '2026-06-05',
    title: {
      id: 'SQL Deployment Formatter',
      en: 'SQL Deployment Formatter',
    },
    description: {
      id: 'Tools baru untuk menyiapkan file SQL, deployment.txt, ZIP, dan catatan ticket sesuai kebutuhan SLRC.',
      en: 'A new tool for preparing SQL files, deployment.txt, ZIP bundles, and ticket notes for SLRC needs.',
    },
    items: {
      id: [
        'Mendukung upload satu atau banyak file SQL.',
        'Menyediakan urutan deployment yang bisa disesuaikan.',
        'Membuat output single SQL atau ZIP sesuai jumlah file.',
      ],
      en: [
        'Supports one or multiple SQL uploads.',
        'Provides editable deployment order.',
        'Generates direct SQL or ZIP output depending on file count.',
      ],
    },
  },
  {
    date: '2026-06-04',
    title: {
      id: 'DOCX to JSON Converter',
      en: 'DOCX to JSON Converter',
    },
    description: {
      id: 'Migrasi converter DOCX lama ke React, TypeScript, dan Vite dengan tampilan dashboard modern.',
      en: 'Migrated the legacy DOCX converter to React, TypeScript, and Vite with a modern dashboard layout.',
    },
    items: {
      id: [
        'Mempertahankan format JSON dan mapping dari versi lama.',
        'Menjalankan konversi langsung saat dokumen Word dipilih.',
        'Menjaga semua proses tetap lokal di browser.',
      ],
      en: [
        'Preserved the JSON format and mapping from the legacy version.',
        'Runs conversion automatically when a Word document is selected.',
        'Keeps all processing local in the browser.',
      ],
    },
  },
]

export function ChangelogPage() {
  const { language, t } = usePreferences()

  return (
    <div>
      <PageHeader
        eyebrow={t('changelogEyebrow')}
        title={t('changelogTitle')}
        description={t('changelogDescription')}
      />

      <p className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {t('changelogStaticNote')}
      </p>

      <section className="mt-8 space-y-4">
        {changelogEntries.map((entry) => (
          <article
            key={`${entry.date}-${entry.title.en}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                  {entry.date}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {entry.title[language]}
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {entry.description[language]}
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {entry.items[language].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}
