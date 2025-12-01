import type { Job, JobStatus } from './types'

export async function getCurrentOrganizationId(): Promise<string> {
  const user = await window.spark.user()
  if (!user) {
    throw new Error('User not authenticated')
  }
  return user.login
}

export const JOB_TIMEOUT_MS = 20 * 60 * 1000

export function getJobStatus(job: Job): JobStatus {
  if (job.status === 'RUNNING' && job.startedAt) {
    const runningDuration = Date.now() - job.startedAt
    if (runningDuration > JOB_TIMEOUT_MS) {
      return 'TIMED_OUT'
    }
  }
  
  return job.status
}

export function isJobTimedOut(job: Job): boolean {
  return getJobStatus(job) === 'TIMED_OUT'
}
