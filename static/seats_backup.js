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
    let geo_dict = {};

    for (let c = 0; c < geography.Airports.length; c++){
        let ciata = geography.Airports[c].CityIata;
        let cname = geography.Airports[c].Name;
        for (let g=0; g < geography.Countries.length; g++){
            let countryname = geography.Countries[g].Name;
            let airport  = geography.Countries[g].Airports;
            if (airport.includes(ciata)){
                if(departAirport == ciata){
                    console.log(ciata, cname, countryname);
                    continue
                }
            }
        }
        // console.log("leave",departAirport, arriveAirport);
    }

    // console.log(geo_dict)
    document.getElementById('outbound').innerHTML = `
    <h3>Departure</h3>
    <div>${departAirport} to ${arriveAirport}</div>
    <div>${basket.JourneyPairs[0].OutboundSlot.Flight.CarrierCode}${basket.JourneyPairs[0].OutboundSlot.Flight.FlightNumber}</div>
    <div>Departure: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalDepartureTime}</div>
    <div>Arrival: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `;
    document.getElementById('inbound').innerHTML = `
    <h3>Return</h3>
    <div>${departAirport} to ${arriveAirport}</div>
    <div>${basket.JourneyPairs[0].ReturnSlot.Flight.CarrierCode}${basket.JourneyPairs[0].OutboundSlot.Flight.FlightNumber}</div>
    <div>Departure: ${basket.JourneyPairs[0].ReturnSlot.Flight.LocalDepartureTime}</div>
    <div>Arrival: ${basket.JourneyPairs[0].ReturnSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `

    // create dynamic seats
    for(let r = 0; r < seats.Rows.length; r++){
        // create <div class="row" row="row_1">
        let divrow = document.createElement('div');  
        divrow.classList = "row";
        divrow.setAttribute("row", `row_${r+1}`);
        
        let seat_count = 0;
        for(let b = 0; b < seats.Rows[r].Blocks.length; b++){
            // create <div class="block">
            let divblock = document.createElement('div');  
            divblock.classList = "block";
            for(let s = 0; s < seats.Rows[r].Blocks[b].Seats.length; s++){
                // get 'A' 'B' 'C' 'D', etc. from SeatNumber
                seat_row = seats.Rows[r].Blocks[b].Seats[s].SeatNumber.slice(1);
                // create <div class="seat" id="seat_1A">
                let divseat = document.createElement('div');
                divseat.classList = "seat";
                let price = seats.Rows[r].Blocks[b].Seats[s].Price;
                let seat_id = `${seats.Rows[r].Blocks[b].Seats[s].SeatNumber}`;
                divseat.id = `${seat_id}`;
                let priceband = seats.Rows[r].Blocks[b].Seats[s].PriceBand;
                if (priceband == 0){
                    priceband = "Regular";
                }
                // console.log(priceband, price);
                seat_count += 1;
                divblock.append(divseat);
                divrow.append(divblock);
                document.getElementById('center').append(divrow);
                // create row number between seets.
                if (r == 0){
                    let rowspan = document.createElement('span');
                    rowspan.append(seat_row);
                    document.getElementById('colnum').append(rowspan);
                }
                // console.log(seat_count);
                if (seat_count == seats.Rows[r].Blocks[b].Seats.length){
                    let rownumber = document.createElement('div');
                    rownumber.classList = "rowshow";
                    rownumber.innerHTML = r+1;
                    divblock.append(rownumber);
                }
                let seat_div = document.getElementById(seat_id);
                // create seat number in outbound
                let seatnum_div = document.createElement('div');
                seatnum_div.classList = "seats";
                if (seat_div){
                    if (seats.Rows[r].Blocks[b].Seats[s].IsAvailable){
                        seat_div.classList.add('available');
                    }else{
                        seat_div.classList.add('unavailable');
                    }
                    seat_div.onclick = ()=>{
                        let al = seat_div.classList.contains('available');
                        // check only available seats to add in outbound.
                        if (al){
                            // set id to seats div and display seat number in outbound.
                            seatnum_div.id = `seat_${seat_id}`;
                            seatnum_div.innerHTML = `
                            <div>Seat: <b><i>${seat_id}</i></b></div>
                            <div>Price: <b><i>${price}</i></b></div>
                            <div>Class: <b><i>${priceband}</i></b></div>
                            `;
                            document.getElementById('outbound').append(seatnum_div);
                            // select all seats inside outbound div
                            let a = document.querySelectorAll("#outbound .seats");
                            // check if 'a' NodeList less than 2 for two seats.
                            if (a.length <= 2){
                                if (seat_div.classList.contains('occupied')){
                                    seat_div.classList.remove('occupied');
                                    // remove seat when seat is deselected.
                                    document.getElementById('outbound').removeChild(seatnum_div);
                                }
                                else{
                                    seat_div.classList.add('occupied');
    
                                }
                            }
                            else{
                                // when 'a' NodeList is greater than 2 change seats.
                                seatnumid1 = split_seatnumber(a[1].id);
                                seatnumid2 = split_seatnumber(a[2].id);
                                let b = document.getElementById(seatnumid1);
                                let c = document.getElementById(seatnumid2);
                                c.classList.add('occupied');
                                b.classList.remove('occupied');
                                document.getElementById('outbound').replaceChild(a[2], a[1]);
                            }
                        }
                    } // seat_div onclick end
                } // check seat_div end
            } // seat end
        } // blocks end
    } // row end
}
function split_seatnumber(seat_num){
    return seat_num.split('_')[1];
}

