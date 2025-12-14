export interface FlightSearchRequest {
  fromPlace: string;
  toPlace: string;
  departureDate: string;
  tripType: string;
}

export interface Flight {
  id: string;
  airlineId: string;
  airlineName: string;       
  flightNumber: string;        
  fromPlace: string;
  toPlace: string;
  departureDateTime: string;   
  arrivalDateTime: string;     
  price: number;
  availableSeats: number;
  totalSeats?: number;          
  tripType?: string;           
  createdAt?: string;          
  updatedAt?: string;         
}
