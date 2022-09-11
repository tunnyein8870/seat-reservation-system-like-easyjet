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
        let cspan = document.createElement('span');
        cspan.classList = "cspan";
        cspan.id = `cspan_${p}`;
        adult_div.append(control_img,adult_img, cspan);
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
                let divseat = document.createElement('div');  // create <div class="seat" id="seat_1A">
                divseat.classList = "seat";
                let price = seats.Rows[r].Blocks[b].Seats[s].Price;
                let seat_id = `${seats.Rows[r].Blocks[b].Seats[s].SeatNumber}`; // get seat id
                divseat.id = `${seat_id}`;
                let priceband = seats.Rows[r].Blocks[b].Seats[s].PriceBand; // set price band
                if (priceband == 0){
                    priceband = "Regular";
                }
                seat_count += 1;
                divblock.append(divseat);
                divrow.append(divblock);
                document.getElementById('center').append(divrow);
                if (r == 0){  // create column number between seets. (A, B, C, D)
                    let rowspan = document.createElement('span');
                    rowspan.append(seat_row);
                    document.getElementById('colnum').append(rowspan);
                }
                if (seat_count == seats.Rows[r].Blocks[b].Seats.length){ // create row numbers (1, 2, 3, etc.)
                    let rownumber = document.createElement('div');
                    rownumber.classList = "rowshow";
                    rownumber.innerHTML = r+1;
                    divblock.append(rownumber);
                }
                let seat_div = document.getElementById(seat_id);
                let seatnum_div = document.createElement('div');  // create seat number in outbound
                seatnum_div.classList = "seats";
                if (seats.Rows[r].Blocks[b].Seats[s].IsAvailable){
                    seat_div.classList.add('available');
                }else{
                    seat_div.classList.add('unavailable');
                }
                if (seat_div){
                    seat_div.onclick = ()=>{
                        passenger = document.querySelector('.current'); // select current seat
                        // passenger.classList.add(seat_div.id);
                        current_passenger = split_number(passenger.id); // get current_passenter's id
                        seatnum_div.id = `seat_${seat_id}`;  // set id to seats div and display seat number in outbound.
                        seatnum_div.innerHTML = `
                        <div>Seat: <b><i>${seat_id}</i></b></div>
                        <div>Price: <b><i>${price}</i></b></div>
                        <div>Class: <b><i>${priceband}</i></b></div>`;
                        document.getElementById('outbound').append(seatnum_div);
                        let cspan = document.querySelectorAll('.cspan'); // get all cspan for adults
                        let outboundseats = document.querySelectorAll("#outbound .seats");  // select all seats inside outbound div
                        if (seat_div.classList.contains('available')){  // check only available seats to add in outbound.
                            if (seat_div.classList.contains('occupied')){
                                seat_div.classList.remove('occupied');
                                document.getElementById('outbound').removeChild(seatnum_div);  // remove seat when seat is deselected.
                                console.log(current_passenger);
                                for (let s in cspan){ // loop and search for id
                                    if (cspan[s].innerHTML == seat_div.id){
                                        cspan[s].innerHTML = "";
                                        document.getElementById(`control_${current_passenger}`).classList.remove('current'); // remove current
                                        document.getElementById(`control_${s}`).classList.add('current'); // move cursor to current
                                    }
                                }
                            }
                            else{
                                passenger.classList.add(seat_div.id); // add seat_id to classlist
                                seat_div.classList.add('occupied');
                                // seat_div.classList.add('occupied'); // add current_passenger to seat
                                if (passenger.classList.length > 3){ // to move passenger
                                    passenger.classList.remove('current'); 
                                    passenger.classList.add('current'); // set current at the end of classlist
                                    last = passenger.classList[passenger.classList.length-2];
                                    second_last = passenger.classList[passenger.classList.length-3];
                                    document.getElementById(second_last).classList.remove('occupied');
                                    document.getElementById(last).classList.add('occupied');
                                    passenger.classList.remove(second_last); // remove to avoid duplicate class
                                }
                                if (current_passenger != numberPassengers-1){
                                    // document.getElementById(`cspan_${current_passenger}`).innerHTML = seat_div.id;
                                    next_passenger = parseInt(current_passenger)+1;  // move selection to next adult
                                    document.getElementById(`control_${current_passenger}`).classList.remove('current');
                                    document.getElementById(`control_${next_passenger}`).classList.add('current');
                                }
                                document.getElementById(`cspan_${current_passenger}`).innerHTML = seat_div.id;
                            }
                            
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

