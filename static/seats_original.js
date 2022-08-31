document.body.onload=async()=>{
    let basket = await(await fetch('/static/basket.json')).json();
    let seats = await(await fetch('/static/seatsOut.json')).json();
    let geography = await(await fetch('/static/geography.json')).json();

    //Calculate the total fare frm the basket
    let numberPassengers = basket.Passengers.length;
    let outfare = basket.JourneyPairs[0].OutboundSlot.Flight.FlightFares[0].Prices.Adult.Price;
    let retfare = basket.JourneyPairs[0].ReturnSlot.Flight.FlightFares[0].Prices.Adult.Price;
    let total = (outfare+retfare) * numberPassengers;
    document.getElementById('basketTotal').innerText = total.toFixed(2);

    //Find outbound flight details
    let departAirport = basket.JourneyPairs[0].OutboundSlot.Flight.DepartureIata;
    let arriveAirport = basket.JourneyPairs[0].OutboundSlot.Flight.ArrivalIata;

    document.getElementById('outbound').innerHTML = `
    <div>${departAirport} to ${arriveAirport}</div>
    <div>${basket.JourneyPairs[0].OutboundSlot.Flight.CarrierCode}${basket.JourneyPairs[0].OutboundSlot.Flight.FlightNumber}</div>
    <div>Departure: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalDepartureTime}</div>
    <div>Arrival: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `;

    // create dynamic seats
    for(let r=0;r<seats.Rows.length;r++){
        // create <div class="row" row="row_1">
        let divrow = document.createElement('div');  
        divrow.classList = "row";
        divrow.setAttribute("row", `row_${r+1}`);
        // <div class="block">
        let divblock = document.createElement('div');  
        divblock.classList = "block";
        for(let b=0;b<seats.Rows[r].Blocks.length;b++){
            for(let s=0; s < seats.Rows[r].Blocks[b].Seats.length;s++){
                // <div class="seat" id="seat_1A">
                let divseat = document.createElement('div');
                divseat.classList = "seat";
                let seat_id = `seat_${seats.Rows[r].Blocks[b].Seats[s].SeatNumber}`;
                divseat.id = `${seat_id}`;
                divblock.append(divseat);
            }
            divrow.append(divblock);
        }
        document.getElementById('center').append(divrow);
    }

    //Mark seats as available or not-available
    for(let r=0;r<seats.Rows.length;r++){
        for(let b=0;b<seats.Rows[r].Blocks.length;b++){
            for(let s=0; s < seats.Rows[r].Blocks[b].Seats.length;s++){
                let seat_id = `seat_${seats.Rows[r].Blocks[b].Seats[s].SeatNumber}`;
                let seat_div = document.getElementById(seat_id);
                if (seat_div){
                    if (seats.Rows[r].Blocks[b].Seats[s].IsAvailable){
                        seat_div.classList.add('available');
                    }else{
                        seat_div.classList.add('unavailable');
                    }
                    seat_div.onclick = ()=>{
                        // select seat or cancel
                        if (seat_div.classList.contains('occupied')){
                            seat_div.classList.remove('occupied');
                        }
                        else{
                            seat_div.classList.add('occupied');
                        }
                    }
                }
            }
        }
    }
}
