

export interface ISemester {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    year: number;
    status: string;
    block?: string[];
}