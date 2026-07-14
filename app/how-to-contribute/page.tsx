import type { Metadata } from 'next'
import { fetchMarkdownFile } from '@/lib/data'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Contribute',
  description: 'Step-by-step guide for students to fork, submit, and open PRs for the Engineering Readiness portal.',
}

export const revalidate = 3600 // 1 hour — this file changes rarely

export default async function HowToContributePage() {
  // Try to fetch the live version from GitHub first
  const content = await fetchMarkdownFile('HOW_TO_CONTRIBUTE.md')

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-3">
            How to <span className="text-gradient">Contribute</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Complete beginner&apos;s guide to Git, GitHub, and submitting your work.
          </p>
        </div>

        {/* Quick links */}
        <div className="card mb-6 border-brand-500/20 bg-brand-500/5">
          <h2 className="text-sm font-bold text-brand-400 mb-2">Quick Commands</h2>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">1.</span>
              <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded flex-1">
                git clone https://github.com/{'<your-username>'}/engineering-readiness.git
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">2.</span>
              <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded flex-1">
                cd engineering-readiness
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">3.</span>
              <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded flex-1">
                {'# Create your files in activities/dayXX/25mxYYY/'}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">4.</span>
              <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded flex-1">
                git add . &amp;&amp; git commit -m &quot;day02: 25mx301 submission&quot;
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">5.</span>
              <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded flex-1">
                git push origin main
              </code>
            </div>
          </div>
        </div>

        {/* Important warning */}
        <div className="card mb-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 mt-0.5">⚠️</span>
            <div>
              <p className="text-yellow-400 font-bold text-sm">Only edit YOUR folders</p>
              <p className="text-yellow-500/80 text-sm mt-0.5">
                Only edit files inside <code className="font-mono bg-yellow-500/10 px-1 rounded">students/{'{rollnumber}'}/ </code>
                and <code className="font-mono bg-yellow-500/10 px-1 rounded">activities/dayXX/{'{rollnumber}'}/</code>.
                Editing anything else will fail the automatic check.
              </p>
            </div>
          </div>
        </div>

        {/* Full markdown guide */}
        {content ? (
          <div className="card">
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <div className="card">
            <div className="prose-fallback space-y-6 text-gray-300">
              <p className="text-yellow-400 text-sm">
                (Could not load the live guide from GitHub — showing the built-in version)
              </p>

              <h2 className="text-xl font-bold text-white">Step 1: Fork the Repository</h2>
              <p>
                Go to <strong>https://github.com/psgmx/engineering-readiness</strong>.
                Click the <strong>&quot;Fork&quot;</strong> button in the top-right corner of the page.
                This creates your own personal copy of the repo under your GitHub account.
                You&apos;ll work entirely in your fork — you will never push directly to the main repo.
              </p>

              <h2 className="text-xl font-bold text-white">Step 2: Clone your fork</h2>
              <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
                {`git clone https://github.com/<your-username>/engineering-readiness.git\ncd engineering-readiness`}
              </pre>
              <p>Replace <code className="font-mono bg-gray-800 px-1 rounded">&lt;your-username&gt;</code> with your actual GitHub username.</p>

              <h2 className="text-xl font-bold text-white">Step 3: Create your files</h2>
              <p>For Day 1, create: <code className="font-mono bg-gray-800 px-1 rounded">students/25mxXXX/profile.md</code> (your roll number).</p>
              <p>For Day 2+, create files in: <code className="font-mono bg-gray-800 px-1 rounded">activities/dayXX/25mxXXX/</code></p>
              <p>Copy the template files from <code className="font-mono bg-gray-800 px-1 rounded">activities/dayXX/_template/</code> as a starting point.</p>

              <h2 className="text-xl font-bold text-white">Step 4: Commit and push</h2>
              <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
                {`git add .\ngit commit -m "day02: 25mx301 submission"\ngit push origin main`}
              </pre>

              <h2 className="text-xl font-bold text-white">Step 5: Open a Pull Request</h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your fork on GitHub</li>
                <li>Click the green &quot;Compare &amp; pull request&quot; button that appears</li>
                <li>Make sure the base repo is <strong>psgmx/engineering-readiness</strong> and base branch is <strong>main</strong></li>
                <li>Click &quot;Create pull request&quot;</li>
              </ol>

              <h2 className="text-xl font-bold text-white">If something goes wrong</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Merge conflicts:</strong> You edited a file you shouldn&apos;t have. Only touch files in your own folders.</li>
                <li><strong>Forgot to fork before cloning:</strong> Delete the folder, fork first on GitHub, then clone from your fork&apos;s URL.</li>
                <li><strong>PR to wrong branch:</strong> Close the PR and open a new one targeting the correct base (main on the owner&apos;s repo).</li>
                <li><strong>Push rejected:</strong> You are trying to push to the owner&apos;s repo — make sure your remote URL points to YOUR fork.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
