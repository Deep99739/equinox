// api/supervisorAgentApi.ts
export async function simulateFatigue(fatigueLevel: number): Promise<any> {
    const res = await fetch("http://localhost:8000/simulate-fatigue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fatigue_level: fatigueLevel }),
    });
    return res.json();
}
