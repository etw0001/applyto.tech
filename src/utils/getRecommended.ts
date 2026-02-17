import { parseInternships, type ParsedInternship, type InternshipCategory } from './parse';

export type { ParsedInternship as RecommendedInternship, InternshipCategory };
export { INTERNSHIP_CATEGORIES } from './parse';

async function getRecommendedRaw(): Promise<string> {
    const url =
        'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md';
    const response = await fetch(url);
    return await response.text();
}

export async function getRecommended(): Promise<ParsedInternship[]> {
    try {
        return parseInternships(await getRecommendedRaw());
    } catch (error) {
        console.error('Error fetching recommended internships:', error);
        return [];
    }
}
