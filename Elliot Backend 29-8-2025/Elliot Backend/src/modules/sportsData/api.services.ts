import axios from "axios";
import { Player } from "./nflTypes";

const API_KEY = process.env.SPORTSDATA_API_KEY as string;

const headers = {
    "Ocp-Apim-Subscription-Key": API_KEY,
};


export const getCurrentSeasonAndWeek = async (): Promise<{ season: string; week: string }> => {
    try {
        const seasonResponse = await axios.get<string>(
            `https://api.sportsdata.io/v3/nfl/scores/json/CurrentSeason`,
            { headers }
        );

        const weekResponse = await axios.get<string>(
            `https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek`,
            { headers }
        );

        return {
            season: seasonResponse.data,
            week: weekResponse.data,
        };
    } catch (err: any) {
        console.error("Error fetching current season and week:", err.message);
        return { season: "null", week: "null" };
    }
};


// export const getActivePlayers = async () => {
//     try {
//         const response = await axios.get<Player[]>(
//             `https://api.sportsdata.io/v3/nfl/scores/json/Players`,
//             { headers }
//         );

//         console.log("====================================================================================Players data", response)


//         const finaldata = response.data
//             .filter((p) => p.Status === "Active" && p.PlayerID && p.Name && p.Position && p.Team && p.PhotoUrl)
//             .map((p) => ({
//                 id: p.PlayerID ?? null,
//                 name: p.Name ?? null,
//                 position: p.Position ?? null,
//                 team: p.Team ?? null,
//                 photo: p.PhotoUrl ?? null,
//                 status: p.Status
//             })).flat();
//         // console.log(finaldata)

//         return finaldata;

//     } catch (err: any) {
//         console.error("Error fetching players:", err.message);
//         return [];
//     }
// };
export const getActivePlayers = async () => {
    try {
        const response = await axios.get<Player[]>(
            `https://api.sportsdata.io/v3/nfl/scores/json/Players`,
            { headers }
        );

        const finaldata = response.data
            .filter(
                (p) =>
                    p.Status === "Active" &&
                    p.PlayerID &&
                    p.Name &&
                    p.Position &&
                    p.Team &&
                    p.PhotoUrl &&
                    ["WR", "TE", "QB", "RB"].includes(p.Position)
            )
            .map((p) => ({
                id: p.PlayerID ?? null,
                name: p.Name ?? null,
                position: p.Position ?? null,
                team: p.Team ?? null,
                photo: p.PhotoUrl ?? null,
                status: p.Status,
            }))
            .flat();

        return finaldata;

    } catch (err: any) {
        console.error("Error fetching players:", err.message);
        return [];
    }
};

export const getPlayerProjection = async (
    playerId: string,
    season: string,
    week: string = "1"
): Promise<any | null> => {
    try {
        const url = `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByPlayerID/${season}/${week}/${playerId}`;
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (err: any) {
        console.error("Error fetching player projection:", err.message);
        return null;
    }
};

export const getOddsData = async (playerId: string, season: string, week: string) => {
    try {
        getActivePlayers()

        const projection = await getPlayerProjection(playerId, season, week);
        console.log(projection)

        if (!projection) {
            throw new Error('Failed to fetch player projection');
        }
        // console.log("===============Projection===============", projection);
        const orgReceivingYards = projection.ReceivingYards || 0;
        const orgReceptions = projection.Receptions || 0;
        const orgTouchdownOdds = projection.PassingTouchdowns ? projection.PassingTouchdowns / 10 : 0;
        const orgPassingAttempts = projection.ReceivingYards || 0;
        const orgPassingYards = projection.ReceivingYards || 0;
        const orgRushingYards = projection.Receptions || 0;
        const orgRushAttempts = projection.Receptions || 0;
        // const orgCatches = 

        const receivingYards = Math.trunc(orgReceivingYards * 100) / 100;
        const receptions = Math.trunc(orgReceptions * 100) / 100;
        const touchdownOdds = Math.trunc(orgTouchdownOdds * 100) / 100;
        const passingAttemptsodds = Math.trunc(orgPassingAttempts * 100) / 100;
        const RushingYards = Math.trunc(orgRushingYards * 100) / 100;
        const RushAttempts = Math.trunc(orgRushAttempts * 100) / 100;
        const passingYards = Math.trunc(orgPassingYards * 100) / 100;

        if (projection.Position === "WR") {
            // If Wide Receiver is Selected: Receiving Yards, Receptions, Anytime TD
            return {
                position: 'WR',
                oddsData_1: { oddsName1: "Receiving Yards", score1: receivingYards },
                oddsData_2: { oddsName2: "Receptions", score2: receptions },
                oddsData_3: { oddsName3: "Anytime Touchdown", score3: touchdownOdds },
            };

        } else if (projection.Position === "QB") {
            // If Quarterback is selected: Passing Yards, Pass attempts, Anytime TD
            return {
                position: 'QB',
                oddsData_1: { oddsName1: "Passing Yards", score1: passingYards },
                oddsData_2: { oddsName2: "Passing Attempts", score2: passingAttemptsodds },
                oddsData_3: { oddsName3: "Anytime Touchdown", score3: touchdownOdds },
            };

        } else if (projection.Position === "RB") {
            // If Running Back is selected for comparison: Rushing Yards, Rush Attempts, Anytime Td
            return {
                position: 'RB',
                oddsData_1: { oddsName1: "Rushing Yards", score1: RushingYards },
                oddsData_2: { oddsName2: "Rush Attempts", score2: RushAttempts },
                oddsData_3: { oddsName3: "Anytime Touchdown", score3: touchdownOdds },
            };

        } else if (projection.Position === "TE") {
            // If Tight End is selected: Receiving Yards, Receptions, Anytime TD
            return {
                position: 'TE',
                oddsData_1: { oddsName1: "Receiving Yards", score1: receivingYards },
                oddsData_2: { oddsName2: "Receptions", score2: receptions },
                oddsData_3: { oddsName3: "Anytime Touchdown", score3: touchdownOdds },
            };

        } else {
            console.log(`${projection.Position}`)
        }

    } catch (err: any) {
        console.error('Error fetching odds data:', err.message);
    }
};


export const calculateScore = (oddsData: any): number => {
    const score1 = oddsData.oddsData_1.score1 * 0.5;
    const score2 = oddsData.oddsData_2.score2 * 0.3;
    const score3 = oddsData.oddsData_3.score3 * 0.2;
    return score1 + score2 + score3;
};


