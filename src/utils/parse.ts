export type InternshipCategory =
    | 'Software Engineering'
    | 'Product Management'
    | 'Data Science, AI/ML'
    | 'Quantitative Finance'
    | 'Hardware Engineering';

export const INTERNSHIP_CATEGORIES: InternshipCategory[] = [
    'Software Engineering',
    'Product Management',
    'Data Science, AI/ML',
    'Quantitative Finance',
    'Hardware Engineering',
];

export interface ParsedInternship {
    company: string;
    role: string;
    location: string;
    link: string;
    posted: string;
    category: InternshipCategory;
}

// Map section header text to category
const CATEGORY_MAP: Record<string, InternshipCategory> = {
    'Software Engineering': 'Software Engineering',
    'Product Management': 'Product Management',
    'Data Science, AI/ML': 'Data Science, AI/ML',
    'Quantitative Finance': 'Quantitative Finance',
    'Hardware Engineering': 'Hardware Engineering',
};

export function parseInternships(fetchText: string): ParsedInternship[] {
    const start =
        '<!-- Please leave a one line gap between this and the table TABLE_START (DO NOT CHANGE THIS LINE) -->';
    const end =
        '<!-- Please leave a one line gap between this and the table TABLE_END (DO NOT CHANGE THIS LINE) -->';
    const text = fetchText.split(start)[1].split(end)[0];

    const lines = text.split('\n');
    const internships: ParsedInternship[] = [];
    let currentCategory: InternshipCategory = 'Software Engineering';
    let prevCompany: string | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect category headers: ## 💻 Software Engineering Internship Roles
        if (line.startsWith('## ')) {
            const headerText = line.replace(/^##\s*/, '').replace(/Internship Roles\s*$/, '').trim();
            // Strip emoji characters from the header
            const cleanHeader = headerText.replace(/[^\x20-\x7E]/g, '').trim();
            for (const [key, category] of Object.entries(CATEGORY_MAP)) {
                if (cleanHeader.includes(key)) {
                    currentCategory = category;
                    prevCompany = null; // Reset company tracking per category
                    break;
                }
            }
            continue;
        }

        // Skip non-row lines
        if (!line.trim().startsWith('<tr>')) continue;

        // Collect the full <tr>...</tr> block (may span multiple lines)
        let rowHtml = '';
        for (let j = i; j < lines.length; j++) {
            rowHtml += lines[j] + '\n';
            if (lines[j].includes('</tr>')) {
                i = j; // advance outer loop
                break;
            }
        }

        // Extract all <td>...</td> cells
        const cellRegex = /<td>([\s\S]*?)<\/td>/g;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
            cells.push(cellMatch[1].trim());
        }

        if (cells.length < 5) continue;

        const companyCell = cells[0];
        const roleCell = cells[1];
        const locationCell = cells[2];
        const applicationCell = cells[3];
        const ageCell = cells[4];

        // Skip closed applications
        if (applicationCell.includes('🔒')) continue;

        // Parse company
        let company = parseCompany(companyCell);
        if (company === '↳' || companyCell.trim() === '↳') {
            company = prevCompany;
        } else if (company) {
            prevCompany = company;
        }

        // Parse role (strip HTML tags)
        const role = parseRole(roleCell);

        // Parse location (handle <details> tags for multiple locations)
        const location = parseLocation(locationCell);

        // Parse application link
        const link = parseApplicationLink(applicationCell);

        // Parse age
        const posted = ageCell.trim();

        if (company && role && link) {
            internships.push({
                company,
                role,
                location: location || '',
                link,
                posted,
                category: currentCategory,
            });
        }
    }

    return internships;
}

function parseCompany(html: string): string | null {
    if (!html) return null;
    const linkMatch = html.match(/<a[^>]*>([^<]+)<\/a>/);
    if (linkMatch) return linkMatch[1].trim();
    const boldMatch = html.match(/<strong>(.*?)<\/strong>/);
    if (boldMatch) return boldMatch[1].trim();
    const stripped = html.replace(/<[^>]*>/g, '').trim();
    return stripped || null;
}

function parseRole(html: string): string | null {
    if (!html) return null;
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text || null;
}

function parseLocation(html: string): string | null {
    if (!html) return null;
    const summaryMatch = html.match(/<summary><strong>(.*?)<\/strong><\/summary>/);
    if (summaryMatch) {
        return summaryMatch[1].trim();
    }
    return html.replace(/<[^>]*>/g, '').trim() || null;
}

function parseApplicationLink(html: string): string | null {
    if (!html) return null;
    const hrefMatch = html.match(/<a href="([^"]+)">/);
    return hrefMatch ? hrefMatch[1] : null;
}
