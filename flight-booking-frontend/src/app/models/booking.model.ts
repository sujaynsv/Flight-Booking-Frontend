export interface Passenger {
    name: string;
    gender :'M' | 'F' | 'OTHER';
    age: number;
    mealPreference: 'VEG' | 'NON_VEG';

}

export interface BookingRequest {
    name: string;
    email: string;
    numberOfSeats: number;
    passengers: Passenger[];
    seatNumbers: string[];
}

export interface Booking{
    id: string;
    pnr: string;
    flightId: string;
    name: string;
    email: string;
    numberOfSeats: number;
    seatNumbers: string[];
    bookingDate: string;
    passengers: Passenger[];
    status?: string;
    totalAmount: number;
}

export interface BookingResponse {
    pnr: string;
}