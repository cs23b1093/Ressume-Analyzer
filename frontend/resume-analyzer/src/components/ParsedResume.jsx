import React from 'react';

const ParsedResume = ({ parsedData }) => {
    const {
        name = '',
        email = '',
        summary = [],
        education = [],
        projects = [],
        skills = [],
        experience = [],
    } = parsedData || {};

    return (
        <div className="parsed-resume p-4 bg-white rounded-lg shadow-md max-w-full">
            <h3 className="text-lg font-bold mb-4">Parsed Resume</h3>
            {name && <p><strong>Name:</strong> {name}</p>}
            {email && <p><strong>Email:</strong> {email}</p>}
            {summary.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold">Summary</h4>
                    <ul className="list-disc list-inside text-sm">
                        {summary.map((item, idx) => <li key={idx}>{String(item)}</li>)}
                    </ul>
                </div>
            )}
            {education.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold">Education</h4>
                    <ul className="list-disc list-inside text-sm">
                        {education.map((item, idx) => (
                            <li key={idx}>
                                {typeof item === 'object'
                                    ? [item.degree, item.institution, item.year].filter(Boolean).join(' — ')
                                    : String(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {projects.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold">Projects</h4>
                    <ul className="list-disc list-inside text-sm">
                        {projects.map((item, idx) => (
                            <li key={idx}>
                                {typeof item === 'object'
                                    ? [item.name, item.description].filter(Boolean).join(': ')
                                    : String(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {skills.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold">Skills</h4>
                    <ul className="list-disc list-inside text-sm">
                        {skills.map((item, idx) => <li key={idx}>{String(item)}</li>)}
                    </ul>
                </div>
            )}
            {experience.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold">Experience</h4>
                    <ul className="list-disc list-inside text-sm">
                        {experience.map((item, idx) => (
                            <li key={idx}>
                                {typeof item === 'object'
                                    ? ([item.position, item.company, item.duration].filter(Boolean).join(' — ') || item.description || '')
                                    : String(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ParsedResume;
