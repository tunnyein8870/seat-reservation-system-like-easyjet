document.body.onload=async()=>{
    let basket = await(await fetch('/static/basket.json')).json();
    // let basket = await(await fetch('/static/basket-amsterdam.json')).json();
    // let basket = await(await fetch('/static/basket-paris.json')).json();
    // let basket = await(await fetch('/static/basket-bari.json')).json();
    let seats = await(await fetch('/static/seatsOut.json')).json();
    let geography = await(await fetch('/static/geography.json')).json();

    //Calculate the total fare frm the basket
    // let numberPassengers = basket.Passengers.length;
    let numberPassengers = 3;
    let outfare = basket.JourneyPairs[0].OutboundSlot.Flight.FlightFares[0].Prices.Adult.Price;
    let retfare = basket.JourneyPairs[0].ReturnSlot.Flight.FlightFares[0].Prices.Adult.Price;
    let total = (outfare+retfare) * numberPassengers;
    document.getElementById('basketTotal').innerText = total.toFixed(2);

    // Choose adult seat for outbound flight
    for (let p=0; p<numberPassengers; p++){
        let adult_div = document.createElement('div');
        adult_div.classList = "adult";
        let adult_img = document.createElement('div');
        adult_img.classList = "adult_img";
        let control_img = document.createElement('div');
        control_img.classList = "control_img";
        control_img.id = `control_${p}`;
        let adult_text = document.createElement('span');
        adult_text.classList = "adult_text";
        adult_text.innerHTML = `Adult: ${p+1}`;
        let cspan = document.createElement('span');
        cspan.classList = "cspan";
        cspan.id = `cspan_${p}`;
        adult_div.append(control_img, adult_text, adult_img, cspan);
        document.getElementById('passengerList').append(adult_div);
        adult_div.onclick = ()=>{
            document.querySelector('.current').classList.remove('current');
            control_img.classList.add("current");
        }
    }
    document.getElementById('control_0').classList.add('current');

    //Find outbound flight details
    let departAirport = basket.JourneyPairs[0].OutboundSlot.Flight.DepartureIata;
    let arriveAirport = basket.JourneyPairs[0].OutboundSlot.Flight.ArrivalIata;
    let departcountry = "";
    let arrivecountry = "";
    for (let c = 0; c < geography.Airports.length; c++){
        let ciata = geography.Airports[c].CityIata;
        let cname = geography.Airports[c].Name;
        for (let g=0; g < geography.Countries.length; g++){
            let countryname = geography.Countries[g].Name;
            let airport  = geography.Countries[g].Airports;
            if (airport.includes(ciata)){   // check for ciata in airport list
                if(departAirport == ciata){
                    departcountry = [countryname, cname];
                }
                if(arriveAirport == ciata){
                    arrivecountry = [countryname, cname];
                }
            }
        }
    }
    
    // console.log(departcountry[1], arrivecountry[1]);
    document.getElementById('outbound').innerHTML = `
    <h3>Departure Details</h3>
    <div>Country: <i>${departcountry[0]} to ${arrivecountry[0]}</i></div>
    <div>Airport: ${departcountry[1]}(${departAirport}) to ${arrivecountry[1]}(${arriveAirport})</div>
    <div>Flight No.: ${basket.JourneyPairs[0].OutboundSlot.Flight.CarrierCode}${basket.JourneyPairs[0].OutboundSlot.Flight.FlightNumber}</div>
    <div>Departure Time: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalDepartureTime}</div>
    <div>Arrival Time: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `; 

    document.getElementById('inbound').innerHTML = `
    <h3>Return Details</h3>
    <div>Country: <i>${arrivecountry[0]} to ${departcountry[0]}</i></div>
    <div>Airport: ${arrivecountry[1]}(${arriveAirport}) to ${departcountry[1]}(${departAirport})</div>
    <div>${arriveAirport} to ${departAirport}</div>
    <div>Flight No.:${basket.JourneyPairs[0].ReturnSlot.Flight.CarrierCode}${basket.JourneyPairs[0].ReturnSlot.Flight.FlightNumber}</div>
    <div>Departure: ${basket.JourneyPairs[0].ReturnSlot.Flight.LocalDepartureTime}</div>
    <div>Arrival Time: ${basket.JourneyPairs[0].ReturnSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `;

    let outbound_seats = document.createElement('div');
    outbound_seats.className = "outbound_seats";
    for (let adult=0; adult<numberPassengers; adult++){
        let seatnum_div = document.createElement('div');
        let seatnum_text = document.createElement('label');
        seatnum_div.id = `outbound_${adult}`;
        seatnum_div.classList = 'seats';
        seatnum_div.innerHTML = "-";
        seatnum_text.innerHTML = `Adult ${adult+1}`;
        seatnum_text.append(seatnum_div);
        outbound_seats.append(seatnum_text);
    }
    document.getElementById('outbound').append(outbound_seats);

    // create dynamic seats
    for(let r = 0; r < seats.Rows.length; r++){
        let divrow = document.createElement('div');  // create <div class="row" row="row_1">
        divrow.classList = "row";
        divrow.setAttribute("row", `row_${r+1}`);
        let seat_count = 0;
        for(let b = 0; b < seats.Rows[r].Blocks.length; b++){
            let divblock = document.createElement('div');  // create <div class="block">
            divblock.classList = "block";
            for(let s = 0; s < seats.Rows[r].Blocks[b].Seats.length; s++){
                seat_row = seats.Rows[r].Blocks[b].Seats[s].SeatNumber.slice(1);  // get 'A' 'B' 'C' 'D', etc. from SeatNumber
                if (r == 0){  // create column number between seets. (A, B, C, D)
                    let rowspan = document.createElement('span');
                    rowspan.append(seat_row);
                    document.getElementById('colnum').append(rowspan);
                }
                let divseat = document.createElement('div');  // create <div class="seat" id="seat_1A">
                divseat.classList = "seat";
                let seat_id = `${seats.Rows[r].Blocks[b].Seats[s].SeatNumber}`; // get seat id
                divseat.id = `${seat_id}`;
                let price = seats.Rows[r].Blocks[b].Seats[s].Price;
                let priceband = seats.Rows[r].Blocks[b].Seats[s].PriceBand; // set price band
                (priceband == 0) ? priceband = "Regular" : priceband;
                seat_count += 1;  // count seat to display in the block middle
                divblock.append(divseat);
                divrow.append(divblock);
                document.getElementById('center').append(divrow);
                if (seat_count == seats.Rows[r].Blocks[b].Seats.length){ // create row numbers (1, 2, 3, etc.)
                    let rownumber = document.createElement('div');
                    rownumber.classList = "rowshow";
                    rownumber.innerHTML = r+1;
                    divblock.append(rownumber);
                }
                let seat_div = document.getElementById(seat_id);
                (seats.Rows[r].Blocks[b].Seats[s].IsAvailable) ? seat_div.classList.add('available') : seat_div.classList.add('unavailable');
                if (seat_div && seat_div.classList.contains('available')){
                    seat_div.onclick = ()=>{
                        // dynamic seat selection
                        passenger = document.querySelector('.current'); // select current seat
                        current_passenger = split_number(passenger.id); // get current_passenter's id
                        let cspan = document.querySelectorAll('.cspan'); // get all cspan for adults
                        let seat = document.querySelectorAll('.seats'); // get all seats from outbound flight
                        // remove seat
                        if (seat_div.classList.contains('occupied')){
                            seat_div.classList.remove('occupied');
                            // delete seat number and move selection from current to next adult seat
                            for (let s in cspan){
                                if (cspan[s].innerHTML == seat_div.id){
                                    cspan[s].innerHTML = "";
                                    document.getElementById(`control_${current_passenger}`).classList.remove('current'); // remove current
                                    document.getElementById(`control_${s}`).classList.add('current'); // move cursor to current
                                }
                            }
                            // remove outbound flight seat
                            for (let se of seat.values()){ // get values to avoid null
                                console.log(se);
                                if (se.classList.contains(seat_div.id)){
                                    se.innerHTML = "-";
                                    se.classList.remove(seat_div.id);
                                }
                            }
                        }
                        else{
                            // select seat
                            passenger.classList.add(seat_div.id); // add seat_id to classlist
                            seat_div.classList.add('occupied'); // select seat
                            if (passenger.classList.length > 3){ // to move passenger
                                passenger.classList.remove('current');
                                passenger.classList.add('current'); // set current at the end of classlist
                                last = passenger.classList[passenger.classList.length-2]; // classname before current
                                second_last = passenger.classList[passenger.classList.length-3]; // classname before last
                                document.getElementById(second_last).classList.remove('occupied'); // remove previous seat class
                                document.getElementById(last).classList.add('occupied'); // add current seat class
                                passenger.classList.remove(second_last); // remove to avoid duplicate class
                            }
                            // to point last passenger of adult seat
                            if (current_passenger != numberPassengers-1){
                                next_passenger = parseInt(current_passenger)+1;  // move selection to next adult
                                document.getElementById(`control_${current_passenger}`).classList.remove('current');
                                document.getElementById(`control_${next_passenger}`).classList.add('current');
                            }
                            document.getElementById(`cspan_${current_passenger}`).innerHTML = seat_div.id;
                            // show seats in outbound flight details
                            let outbound_current = document.getElementById(`outbound_${current_passenger}`);
                            outbound_current.classList.add(seat_div.id);
                            if (outbound_current.classList.length > 2){
                                let a = outbound_current.classList[outbound_current.classList.length-1]
                                let b = outbound_current.classList[outbound_current.classList.length-2]
                                outbound_current.classList.remove(b);
                                outbound_current.classList.add(a);
                            }
                            document.getElementById(`outbound_${current_passenger}`).innerHTML = `
                            <div>Seat No.: ${seat_div.id}</div>
                            <div>Price: ${price}</div>
                            <div>Class: ${priceband}</div>
                            `;
                        }
                    } // seat_div onclick end
                } // check seat_div end
            } // seat end
        } // blocks end
    } // row end
}

function split_number(seat_num){
    return seat_num.split('_')[1];
}
