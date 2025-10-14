'use client'

import React, { useState, useEffect } from 'react'

interface Persona {
    title: string
    description: string
}

interface PaperInfo {
    ID: string
    Title: string
    File: string
    File_Upload_Date: string
    Review_Status: string
    First_Name: string
    Last_Name: string
}

interface SessionInfo {
    Program_ID: string
    Session_Number: string
    Session_Title: string
    Session_Description: string
    Order_In_Session: string
    Session_Type: string
    Session_Track: string
    Session_Room: string
    Session_Day: string
    Session_Start_Time: string
    Session_End_Time: string
    Presentation_Start: string
    Presentation_End: string
}

interface PersonaRelevance {
    Persona: string
    Relevance_Score: string
    Rationale: string
}

interface PersonaAnalysis {
    Relevant_Personas: PersonaRelevance[]
    Summary_Assessment: string
}

interface Paper {
    Paper_Info: PaperInfo
    Session_Info: SessionInfo
    Persona_Analysis: PersonaAnalysis
    relevance?: string
    paperId?: string
}

interface PersonaPaperMapping {
    Persona: string
    High_Relevance_Papers?: string[]
    Medium_Relevance_Papers?: string[]
    Low_Relevance_Papers?: string[]
}

export default function Home() {
    const [personas, setPersonas] = useState<Persona[]>([])
    const [allPapers, setAllPapers] = useState<Record<string, Paper>>({})
    const [papersByPersona, setPapersByPersona] = useState<PersonaPaperMapping[]>([])
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
    const [selectedDay, setSelectedDay] = useState<string>('12/02')
    const [selectedRelevance, setSelectedRelevance] = useState<string>('all')
    const [loading, setLoading] = useState(true)

    // Load all data on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Use relative paths that work with basePath
            const basePath = process.env.NODE_ENV === 'production' ? '/iitsec_refer' : ''
            const [papersResponse, mappingResponse] = await Promise.all([
                fetch(`${basePath}/all_papers_merged.json`),
                fetch(`${basePath}/papers_by_persona.json`)
            ])

            const papers = await papersResponse.json()
            const mapping: PersonaPaperMapping[] = await mappingResponse.json()

            setAllPapers(papers)
            setPapersByPersona(mapping)

            // Generate personas dynamically from the mapping data
            const generatedPersonas: Persona[] = mapping
                .filter(personaData => {
                    // Filter out personas with less than 3 recommendations
                    const highCount = personaData.High_Relevance_Papers?.length || 0
                    const mediumCount = personaData.Medium_Relevance_Papers?.length || 0
                    return (highCount + mediumCount) >= 3
                })
                .map(personaData => ({
                    title: personaData.Persona,
                    description: generatePersonaDescription(personaData.Persona)
                }))

            setPersonas(generatedPersonas)
            setLoading(false)
        } catch (error) {
            console.error('Error loading data:', error)
            setLoading(false)
        }
    }

    const generatePersonaDescription = (personaName: string): string => {
        const descriptions: Record<string, string> = {
            'Academic – Researcher or Professor': 'An educator or research lead aiming to connect with DoD needs, publish findings, and collaborate on applied M&S projects.',
            'Defense Industry Executive / Business Director': 'A senior leader seeking insights on trends, government needs, and strategic partnership opportunities.',
            'Government – Acquisitions Professional': 'Responsible for identifying, evaluating, and procuring cutting-edge simulation and training systems for defense needs.',
            'Government – Civilian (Early-Career)': 'A newer federal employee aiming to grow professionally, earn CLPs, and understand how M&S supports mission readiness.',
            'Government – Civilian (Mid-Career)': 'An established defense civilian with growing responsibility looking to apply advanced insights and contribute to workforce development.',
            'Government – Enlisted': 'A tactical-level service member looking to increase technical knowledge and apply best practices in training delivery and support.',
            'Government – Officer or SES': 'A strategic leader shaping training policy, acquisition priorities, and cross-functional coordination within the defense ecosystem.',
            'Industry Professional (Early-Career)': 'A recent entrant into the training and simulation workforce looking to build skills, learn best practices, and expand their network.',
            'Industry Professional (Mid-Career)': 'An experienced technical or program lead seeking to stay current on innovations and deepen their contributions to M&S programs.',
            'International Delegate': 'A global attendee exploring U.S. training and simulation capabilities to support foreign military or education missions.',
            'Recruiter/Workforce Strategist': 'Focused on talent acquisition and workforce development in the training and simulation industry.',
            'Small Business Innovator / Tech Entrepreneur': 'A startup leader or emerging tech developer eager to showcase innovation, find partners, and engage with defense stakeholders.',
            'Student': 'A college or grad student exploring career pathways in STEM, modeling and simulation, or national security fields.'
        }

        return descriptions[personaName] || 'Interested in training and simulation technologies for defense and education.'
    }

    const getPersonaPapers = (): Paper[] => {
        if (!selectedPersona) return []

        const personaData = papersByPersona.find(p => p.Persona === selectedPersona.title)

        if (!personaData) return []

        const papers: Paper[] = []

        // Add papers by relevance
        const addPapers = (paperIds: string[] | undefined, relevance: string) => {
            if (paperIds) {
                paperIds.forEach(paperId => {
                    if (allPapers[paperId]) {
                        papers.push({
                            ...allPapers[paperId],
                            relevance,
                            paperId
                        })
                    }
                })
            }
        }

        addPapers(personaData.High_Relevance_Papers, 'High')
        addPapers(personaData.Medium_Relevance_Papers, 'Medium')
        addPapers(personaData.Low_Relevance_Papers, 'Low')

        return papers
    }

    const parseDateTime = (dateStr: string, timeStr: string): Date => {
        if (!dateStr || !timeStr) return new Date(0)

        const [month, day, year] = dateStr.split('/')
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
        if (!timeParts) return new Date(0)

        let hours = parseInt(timeParts[1])
        const minutes = parseInt(timeParts[2])
        const period = timeParts[3].toUpperCase()

        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0

        return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes)
    }

    const detectConflicts = (papers: Paper[]): Set<string> => {
        const timeSlots = new Map<string, string[]>()

        papers.forEach(paper => {
            const sessionInfo = paper.Session_Info
            const key = `${sessionInfo.Session_Day}_${sessionInfo.Presentation_Start}_${sessionInfo.Presentation_End}`

            if (!timeSlots.has(key)) {
                timeSlots.set(key, [])
            }
            if (paper.paperId) {
                timeSlots.get(key)!.push(paper.paperId)
            }
        })

        const conflicts = new Set<string>()
        timeSlots.forEach((paperIds) => {
            if (paperIds.length > 1) {
                paperIds.forEach(id => conflicts.add(id))
            }
        })

        return conflicts
    }

    const getFilteredAndSortedPapers = () => {
        let papers = getPersonaPapers()

        // Filter by relevance
        if (selectedRelevance !== 'all') {
            papers = papers.filter(p => p.relevance?.toLowerCase() === selectedRelevance.toLowerCase())
        }

        // Filter by day (always filter, no "all" option)
        papers = papers.filter(p => {
            const sessionDate = p.Session_Info.Session_Day
            return sessionDate && sessionDate.includes(selectedDay)
        })

        // Sort by date and time
        papers.sort((a, b) => {
            const dateA = parseDateTime(a.Session_Info.Session_Day, a.Session_Info.Presentation_Start)
            const dateB = parseDateTime(b.Session_Info.Session_Day, b.Session_Info.Presentation_Start)
            return dateA.getTime() - dateB.getTime()
        })

        return papers
    }

    const getPersonaPaperCount = (persona: Persona): number => {
        const personaData = papersByPersona.find(p => p.Persona === persona.title)

        if (!personaData) return 0

        const highCount = personaData.High_Relevance_Papers?.length || 0
        const mediumCount = personaData.Medium_Relevance_Papers?.length || 0

        return highCount + mediumCount
    }

    const PersonaCard = ({ persona, onClick }: { persona: Persona; onClick: () => void }) => {
        const paperCount = getPersonaPaperCount(persona)

        return (
            <div
                onClick={onClick}
                style={{
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'
                    e.currentTarget.style.borderColor = '#333'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'transparent'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a', flex: 1 }}>
                        {persona.title}
                    </div>
                    <div style={{
                        background: '#333',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        minWidth: '40px',
                        textAlign: 'center',
                        marginLeft: '10px'
                    }}>
                        {paperCount}
                    </div>
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.85, color: '#333' }}>
                    {persona.description}
                </div>
            </div>
        )
    }

    const PaperCard = ({ paper, isConflict }: { paper: Paper; isConflict: boolean }) => {
        const sessionInfo = paper.Session_Info
        const paperInfo = paper.Paper_Info

        let rationale = ''
        if (selectedPersona && paper.Persona_Analysis?.Relevant_Personas) {
            const personaMatch = paper.Persona_Analysis.Relevant_Personas.find(p =>
                p.Persona === selectedPersona.title
            )

            if (personaMatch) {
                rationale = personaMatch.Rationale
            }
        }

        return (
            <div
                style={{
                    background: isConflict ? '#fff5f5' : '#ffffff',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '15px',
                    borderLeft: `5px solid ${isConflict ? '#ff4444' : '#333'}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translateX(5px)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateX(0)'
                }}
            >
                {isConflict && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: '#ff4444',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                    }}>
                        Time Conflict with another recommendation
                    </div>
                )}

                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'white', padding: '5px 12px', borderRadius: '15px', fontWeight: 500 }}>
                        📅 {sessionInfo.Session_Day || 'TBD'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'white', padding: '5px 12px', borderRadius: '15px', fontWeight: 500 }}>
                        🕐 {sessionInfo.Presentation_Start || 'TBD'} - {sessionInfo.Presentation_End || 'TBD'}
                    </span>
                    {sessionInfo.Session_Room && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'white', padding: '5px 12px', borderRadius: '15px', fontWeight: 500 }}>
                            📍 Room {sessionInfo.Session_Room}
                        </span>
                    )}
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                    {paperInfo.Title}
                </div>

                <div style={{ fontSize: '1rem', color: '#333', fontWeight: 600, marginBottom: '8px' }}>
                    {sessionInfo.Session_Title || 'Session TBD'}
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {sessionInfo.Session_Track && (
                        <span style={{ background: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', color: '#666' }}>
                            🏷️ {sessionInfo.Session_Track}
                        </span>
                    )}
                    {sessionInfo.Session_Type && (
                        <span style={{ background: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', color: '#666' }}>
                            📋 {sessionInfo.Session_Type}
                        </span>
                    )}
                    {paperInfo.First_Name && paperInfo.Last_Name && (
                        <span style={{ background: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', color: '#666' }}>
                            👤 {paperInfo.First_Name} {paperInfo.Last_Name}
                        </span>
                    )}
                </div>

                {rationale && (
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #e0e0e0' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '5px 12px',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            background: paper.relevance === 'High' ? '#d4edda' : paper.relevance === 'Medium' ? '#fff3cd' : '#f8d7da',
                            color: paper.relevance === 'High' ? '#155724' : paper.relevance === 'Medium' ? '#856404' : '#721c24',
                        }}>
                            {paper.relevance} Relevance
                        </div>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#555', fontStyle: 'italic' }}>
                            "{rationale}"
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
        <button
            onClick={onClick}
            style={{
                padding: '10px 20px',
                border: '2px solid #333',
                background: active ? '#333' : 'white',
                color: active ? 'white' : '#333',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
                fontWeight: 600,
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.background = '#f5f5f5'
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'white'
                }
            }}
        >
            {children}
        </button>
    )

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}>
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: 'white' }}>
                    Loading data...
                </div>
            </div>
        )
    }

    const papers = getFilteredAndSortedPapers()
    const conflicts = detectConflicts(papers)
    const uniqueDays = new Set(papers.map(p => p.Session_Info.Session_Day).filter(d => d))

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', color: 'white', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', fontWeight: 700 }}>
                        I/ITSEC 2025
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: 400 }}>
                        Personalized Paper Recommendations
                    </p>
                </header>

                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    minHeight: '500px',
                }}>
                    {!selectedPersona ? (
                        <>
                            <h2>Choose Your Persona</h2>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                Select the persona that best describes you to get personalized paper recommendations.
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '20px',
                                marginTop: '20px',
                            }}>
                                {personas.map((persona, index) => (
                                    <PersonaCard
                                        key={index}
                                        persona={persona}
                                        onClick={() => {
                                            setSelectedPersona(persona)
                                            setSelectedDay('12/02')
                                            setSelectedRelevance('all')
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setSelectedPersona(null)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#333',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '20px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#1a1a1a'
                                    e.currentTarget.style.transform = 'translateX(-5px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#333'
                                    e.currentTarget.style.transform = 'translateX(0)'
                                }}
                            >
                                ← Back to Personas
                            </button>

                            <div style={{
                                background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
                                color: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                            }}>
                                <h2 style={{ marginBottom: '8px', fontWeight: 700 }}>{selectedPersona.title}</h2>
                                <p style={{ fontWeight: 400 }}>{selectedPersona.description}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <div style={{ background: 'white', padding: '15px 25px', borderRadius: '10px', borderLeft: '4px solid #333' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{papers.length}</div>
                                    <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Recommended Papers</div>
                                </div>
                                {conflicts.size > 0 && (
                                    <div style={{ background: 'white', padding: '15px 25px', borderRadius: '10px', borderLeft: '4px solid #ff4444' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4444' }}>{conflicts.size}</div>
                                        <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Scheduling Conflicts</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 'bold', color: '#333' }}>Filter by Day:</span>
                                    <FilterButton active={selectedDay === '12/02'} onClick={() => setSelectedDay('12/02')}>Dec 2</FilterButton>
                                    <FilterButton active={selectedDay === '12/03'} onClick={() => setSelectedDay('12/03')}>Dec 3</FilterButton>
                                    <FilterButton active={selectedDay === '12/04'} onClick={() => setSelectedDay('12/04')}>Dec 4</FilterButton>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 'bold', color: '#333' }}>Relevance:</span>
                                    <FilterButton active={selectedRelevance === 'all'} onClick={() => setSelectedRelevance('all')}>All</FilterButton>
                                    <FilterButton active={selectedRelevance === 'high'} onClick={() => setSelectedRelevance('high')}>High</FilterButton>
                                    <FilterButton active={selectedRelevance === 'medium'} onClick={() => setSelectedRelevance('medium')}>Medium</FilterButton>
                                </div>
                            </div>

                            <div>
                                {papers.length > 0 ? (
                                    papers.map((paper, index) => (
                                        <PaperCard
                                            key={index}
                                            paper={paper}
                                            isConflict={conflicts.has(paper.paperId || '')}
                                        />
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
                                        <h3>No papers found</h3>
                                        <p>Try adjusting your filters.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
