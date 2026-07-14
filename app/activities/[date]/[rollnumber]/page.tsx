import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import {
  getAllData,
  buildActivityDays,
  fetchMarkdownFile,
} from '@/lib/data'

interface Props {
  params: Promise<{ date: string; rollnumber: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date, rollnumber } = await params
  const { roster } = await getAllData()
  const student = roster[rollnumber]
  const label = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  
  if (!student) return { title: 'Submission Not Found' }
  
  return {
    title: `${student.name}'s Submission - ${label}`,
    description: `Submission by ${student.name} (${rollnumber}) for ${label}.`,
  }
}

export const revalidate = 60

export default async function StudentSubmissionPage({ params }: Props) {
  const { date, rollnumber } = await params
  const { roster, attendance } = await getAllData()
  
  const student = roster[rollnumber]
  if (!student) notFound()

  const activityDays = buildActivityDays(roster, attendance)
  const activityDay = activityDays.find(d => d.id === date)
  if (!activityDay) notFound()

  // Fetch the markdown files
  const readme = await fetchMarkdownFile(`activities/${date}/${rollnumber}/README.md`)
  const reflection = await fetchMarkdownFile(`activities/${date}/${rollnumber}/reflection.md`)
  const prompts = await fetchMarkdownFile(`activities/${date}/${rollnumber}/prompts.md`)

  const label = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  // If no files at all, maybe it's missing or they didn't submit
  const noSubmission = !readme && !reflection && !prompts

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in relative">
      {/* Sidebar: Navigation & Other Students */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="sticky top-8 space-y-6">
          <div className="text-sm text-slate-500">
            <Link href={`/activities/${date}`} className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <span>←</span> Back to {label}
            </Link>
          </div>

          <div className="card bg-slate-900/60 p-5">
            <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wide">
              Submitter Info
            </h3>
            <div className="font-mono text-xs text-brand-400 mb-1">{rollnumber}</div>
            <div className="font-semibold text-lg text-white mb-1">{student.name}</div>
            <div className="text-sm text-slate-400 mb-3">{student.team ? `Team: ${student.team}` : 'No team'}</div>
            
            <Link href={`/students/${rollnumber}`} className="btn-ghost w-full text-xs py-1.5 border border-slate-700">
              View Profile
            </Link>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-white mb-3 text-sm">Other Submitters ({activityDay.submitters.length})</h3>
            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-1">
              {activityDay.submitters.map(roll => {
                const isActive = roll === rollnumber;
                return (
                  <Link
                    key={roll}
                    href={`/activities/${date}/${roll}`}
                    className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                      isActive 
                        ? 'bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-xs opacity-70 mr-2">{roll}</span>
                    <span className="truncate inline-block align-bottom max-w-[100px]">{roster[roll]?.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content: Markdown Render */}
      <main className="flex-1 min-w-0">
        <div className="card p-6 md:p-10 bg-slate-950/60 backdrop-blur-2xl border-slate-800/80 shadow-2xl">
          <header className="mb-8 border-b border-slate-800/60 pb-6">
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Submission: <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">{label}</span>
            </h1>
            <p className="text-slate-400">By {student.name} ({rollnumber})</p>
          </header>

          {noSubmission ? (
            <div className="py-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700/50">
              <span className="text-4xl mb-3 block">📄</span>
              <p>No markdown files found for this submission.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {readme && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-brand-500 rounded-sm"></span>
                    README.md
                  </h2>
                  <div className="prose prose-invert prose-brand max-w-none prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-800 prose-img:rounded-xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {readme}
                    </ReactMarkdown>
                  </div>
                </section>
              )}

              {reflection && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-sm"></span>
                    reflection.md
                  </h2>
                  <div className="prose prose-invert prose-purple max-w-none prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-800 prose-img:rounded-xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {reflection}
                    </ReactMarkdown>
                  </div>
                </section>
              )}

              {prompts && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-pink-500 rounded-sm"></span>
                    prompts.md
                  </h2>
                  <div className="prose prose-invert prose-pink max-w-none prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-800 prose-img:rounded-xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {prompts}
                    </ReactMarkdown>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
