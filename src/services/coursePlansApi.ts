export interface CoursePlanFile {
  name: string;
  relativePath: string;
  size: number;
  mtimeMs: number;
}

export interface CoursePlansApiResponse {
  ok: boolean;
  baseDir: string;
  count: number;
  files: CoursePlanFile[];
  errors: string[];
}

const REQUEST_TIMEOUT_MS = 7000;

export const fetchCoursePlans = async (): Promise<CoursePlansApiResponse> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/course-plans", {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`course_plans_http_${response.status}`);
    }

    const payload = (await response.json()) as Partial<CoursePlansApiResponse>;

    return {
      ok: Boolean(payload.ok),
      baseDir: typeof payload.baseDir === "string" ? payload.baseDir : "",
      count: typeof payload.count === "number" ? payload.count : 0,
      files: Array.isArray(payload.files) ? payload.files : [],
      errors: Array.isArray(payload.errors) ? payload.errors : [],
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};

