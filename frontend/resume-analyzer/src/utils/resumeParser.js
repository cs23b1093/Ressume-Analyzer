const parseResume = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const parsed = {
        name: '',
        email: '',
        summary: [],
        education: [],
        projects: [],
        skills: [],
        experience: []
    };

    // Regex for email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

    // Find email
    for (const line of lines) {
        const match = line.match(emailRegex);
        if (match) {
            parsed.email = match[0];
            break;
        }
    }

    // Extract name from first line, taking first two words after cleaning
    if (lines.length > 0) {
        const firstLine = lines[0];
        const cleanLine = firstLine.split('|')[0].split('@')[0].split('+')[0].replace(/[^\w\s]/g, '').trim();
        const words = cleanLine.split(/\s+/).filter(w => w.length > 2);
        if (words.length >= 2) {
            parsed.name = words.slice(0, 2).join(' ');
        } else if (words.length > 0) {
            parsed.name = words[0];
        }
    }

    // Section keywords
    const sections = {
        summary: /summary|objective|profile/i,
        education: /education|degree|b\.tech|b\.e|master|ph\.d/i,
        projects: /projects?/i,
        skills: /skills?|technologies|tools/i,
        experience: /experience|work|job|internship/i
    };

    let currentSection = null;
    let collecting = false;

    for (const line of lines) {
        // Check if line is a section header
        let foundSection = null;
        for (const [key, regex] of Object.entries(sections)) {
            if (regex.test(line)) {
                foundSection = key;
                break;
            }
        }

        if (foundSection) {
            currentSection = foundSection;
            collecting = true;
            continue; // Skip the header line
        }

        if (collecting && currentSection && line) {
            // Check if next section starts
            let nextSection = null;
            for (const [key, regex] of Object.entries(sections)) {
                if (regex.test(line)) {
                    nextSection = key;
                    break;
                }
            }
            if (nextSection) {
                currentSection = nextSection;
                collecting = true;
                continue;
            }

            // Add to current section
            if (parsed[currentSection]) {
                parsed[currentSection].push(line);
            }
        }
    }

    // Fallback parsing if sections are empty
    if (parsed.education.length === 0 && parsed.experience.length === 0 && parsed.skills.length === 0 && parsed.projects.length === 0) {
        let fallbackSection = null;
        let fallbackContent = [];

        for (let i = 2; i < lines.length; i++) { // Skip first 2 lines
            const line = lines[i];
            if (line.length < 3) continue;

            // Education patterns
            if (/b\.tech|b\.e|university|college|degree|engineering/i.test(line) && parsed.education.length === 0) {
                if (fallbackSection && fallbackContent.length > 0) {
                    parsed[fallbackSection] = fallbackContent;
                }
                fallbackSection = 'education';
                fallbackContent = [line];
            }
            // Experience patterns
            else if (/company|intern|developer|engineer|manager|software/i.test(line) && parsed.experience.length === 0) {
                if (fallbackSection && fallbackContent.length > 0) {
                    parsed[fallbackSection] = fallbackContent;
                }
                fallbackSection = 'experience';
                fallbackContent = [line];
            }
            // Skills patterns
            else if (/javascript|python|java|react|node|html|css|sql|git|api/i.test(line) && parsed.skills.length === 0) {
                if (fallbackSection && fallbackContent.length > 0) {
                    parsed[fallbackSection] = fallbackContent;
                }
                fallbackSection = 'skills';
                fallbackContent = [line];
            }
            // Projects patterns
            else if (/project|built|developed|created/i.test(line) && parsed.projects.length === 0) {
                if (fallbackSection && fallbackContent.length > 0) {
                    parsed[fallbackSection] = fallbackContent;
                }
                fallbackSection = 'projects';
                fallbackContent = [line];
            }
            else if (fallbackSection) {
                fallbackContent.push(line);
            }
        }

        // Save last fallback section
        if (fallbackSection && fallbackContent.length > 0) {
            parsed[fallbackSection] = fallbackContent;
        }
    }

    return parsed;
};

export default parseResume;
