const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    next: { revalidate: 60 } // Default 60 seconds revalidation
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch API: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    return null;
  }
}

export async function getCourses() {
  const res = await fetchAPI('/frontend/courses');
  return res?.success ? res.data : [];
}

export async function getCourseBySlug(slug: string) {
  const res = await fetchAPI(`/frontend/courses/${slug}`);
  return res?.success ? res.data : null;
}

export async function getBlogs() {
  const res = await fetchAPI('/frontend/blogs');
  return res?.success ? res.data : null;
}

export async function getBlogBySlug(slug: string) {
  const res = await fetchAPI(`/frontend/blogs/${slug}`);
  return res?.success ? res.data : null;
}

export async function getPageContent(slug: string) {
  const res = await fetchAPI(`/frontend/pages/${slug}`);
  return res?.success ? res.data : null;
}
