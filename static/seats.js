document.body.onload=async()=>{
    document.getElementById("rhs").style.width = "0";
    let basket = await(await fetch('/static/basket.json')).json();
    // let basket = await(await fetch('/static/basket-amsterdam.json')).json();
    // let basket = await(await fetch('/static/basket-paris.json')).json();
    // let basket = await(await fetch('/static/basket-bari.json')).json();
    let seats = await(await fetch('/static/seatsOut.json')).json();
    let geography = await(await fetch('/static/geography.json')).json();

    //Calculate the total fare frm the basket
    var numberPassengers = basket.Passengers.length;
    var numberPassengers = 3;
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
        let cspan = document.createElement('div');
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
    odate = get_date_time(`${basket.JourneyPairs[0].OutboundSlot.Flight.LocalDepartureTime}`);
    rdate = get_date_time(`${basket.JourneyPairs[0].ReturnSlot.Flight.LocalDepartureTime}`);
    document.getElementById('outbound').innerHTML = `
    <h3>Departure Details</h3>
    <div class="country">From ${departcountry[0]} To ${arrivecountry[0]}</div>
    <div class="airport">${departcountry[1]}(${departAirport}) to ${arrivecountry[1]}(${arriveAirport})</div>
    <div class="flight">Flight No.: ${basket.JourneyPairs[0].OutboundSlot.Flight.CarrierCode}${basket.JourneyPairs[0].OutboundSlot.Flight.FlightNumber}</div>
    <div class="dtime">Departure Time: ${odate}</div>
    <div class="atime">Arrival Time: ${basket.JourneyPairs[0].OutboundSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `;

    document.getElementById('inbound').innerHTML = `
    <h3>Return Details</h3>
    <div class="country">From ${arrivecountry[0]} To ${departcountry[0]}</div>
    <div class="airport">${arrivecountry[1]}(${arriveAirport}) to ${departcountry[1]}(${departAirport})</div>
    <div class="flight">Flight No.:${basket.JourneyPairs[0].ReturnSlot.Flight.CarrierCode}${basket.JourneyPairs[0].ReturnSlot.Flight.FlightNumber}</div>
    <div class="dtime">Departure: ${rdate}</div>
    <div class="atime">Arrival Time: ${basket.JourneyPairs[0].ReturnSlot.Flight.LocalArrivalTime.substring(11,16)}</div>
    `;

    // show fares in outbound and return
    let fare = document.createElement('div');
    fare.classList = "allfare";
    fare.innerHTML = `<div class="fares">Your fares</div> <div class="fare_pass">Adult</div><div class="numpass">${numberPassengers} x ${outfare}</div>`;
    document.getElementById('outbound').append(fare);
    let re = document.createElement('div');
    re.innerHTML = `<div class="fares">Your fares</div> <div class="fare_pass">Adult</div><div class="numpass">${numberPassengers} x ${retfare}</div>`;
    re.classList = "allfare";
    document.getElementById('inbound').append(re);
    
    // create button in inbound/return details
    skip_btn = document.createElement('div');
    skip_btn.id = 'skip_btn';
    skip_btn.innerHTML = "Skip seats >";
    document.getElementById('inbound').append(skip_btn);
    document.getElementById('skip-btn').innerHTML = "Skip seats >";

    // create seat div for outbound
    let flight_details = document.createElement('div');
    flight_details.classList = "flight_details";
    flight_details.innerHTML = "Your Flight Details"
    let outbound_seats = document.createElement('div');
    outbound_seats.className = "outbound_seats";
    for (let adult=0; adult<numberPassengers; adult++){
        let seatnum_div = document.createElement('div');
        seatnum_div.id = `outbound_${adult}`;
        seatnum_div.classList = 'seats';
        seatnum_div.innerHTML = "-";
        outbound_seats.append(seatnum_div);
    }
    flight_details.append(outbound_seats);
    document.getElementById('outbound').append(flight_details);
    
    // create dynamic seats
    let nose = document.createElement('div');
    nose.className = "nose";
    document.getElementById('center').append(nose);
    let rPrice = new Map();
    let rPlace = new Map();
    rPriceing(seats, rPrice, rPlace); // group rows of same price
    for(let r = 0; r < seats.Rows.length; r++){
        let divrow = document.createElement('div');  // create <div class="row" row="row_1">
        divrow.setAttribute("row", `row_${r+1}`);
        divrow.id = `r_${r}`;
        for (const price of rPlace.keys()) {
            if(rPlace.get(price)==r){
                rowPrice =document.createElement('span');
                rowPrice.className = "rowprice";
                rowPrice.innerHTML =`
                <div class="rprice">£${price.split(' ')[0]}</div>
                <div class="rband">${price.slice(5,)}</div>
                `;
                document.getElementById('center').append(rowPrice);
                rPlace.delete(price);
            }
         } 
        document.getElementById('center').append(divrow);
        let seat_count = 0;
        for(let b = 0; b < seats.Rows[r].Blocks.length; b++){
            let divblock = document.createElement('div');  // create <div class="block">
            divblock.classList = "block";
            divrow.append(divblock);
            for(let s = 0; s < seats.Rows[r].Blocks[b].Seats.length; s++){
                let divseat = document.createElement('div');  // create <div class="seat" id="seat_1A">
                divseat.classList = "seat";
                let seat_id = `${seats.Rows[r].Blocks[b].Seats[s].SeatNumber}`; // get seat id
                divseat.id = `${seat_id}`;
                seat_count += 1;  // count seat to display in the block middle
                divblock.append(divseat);
                if (seat_count == seats.Rows[r].Blocks[b].Seats.length){ // create row numbers (1, 2, 3, etc.)
                    let rownumber = document.createElement('div');
                    rownumber.classList = "rowshow";
                    rownumber.innerHTML = r+1;
                    divblock.append(rownumber);
                }
                let price =seats.Rows[r].Blocks[b].Seats[s].Price;
                let priceband = seats.Rows[r].Blocks[b].Seats[s].PriceBand; // set price band
                (priceband == 0) ? priceband = "Regular" : priceband;
                let seat_div = document.getElementById(seat_id);
                (seats.Rows[r].Blocks[b].Seats[s].IsAvailable) ? seat_div.classList.add('available') : seat_div.classList.add('unavailable');
                if (seat_div && seat_div.classList.contains('available')){
                    seat_div.onclick = ()=>{
                        passenger = document.querySelector('.current');
                        current_passenger = split_number(passenger.id); // e.g. passenger_0 to 0
                        if (seat_div.classList.contains('occupied')){  // remove or unselect seat
                            seat_div.classList.remove('occupied'); // unselect seat
                            delete_seats(seat_div, current_passenger); // remove seat
                            total -= price;
                            document.getElementById('basketTotal').innerText = total.toFixed(2);
                            show_select_text();
                        }
                        else{ // select seat
                            seat_div.classList.add('occupied'); // select seat
                            passenger.classList.add(seat_div.id); // add seat_id to classlist
                            if (passenger.classList.length > 3){ // to move passenger
                                passenger.classList.remove('current');
                                passenger.classList.add('current'); // set current at the end of classlist
                                document.getElementById(passenger.classList[passenger.classList.length-3]).classList.remove('occupied'); // remove previous seat class
                                document.getElementById(passenger.classList[passenger.classList.length-2]).classList.add('occupied'); // add current seat class
                                passenger.classList.remove(passenger.classList[passenger.classList.length-3]); // remove to avoid duplicate class
                            }
                            // to point last passenger of adult seat
                            if (current_passenger != numberPassengers-1){
                                next_passenger = parseInt(current_passenger)+1;  // move selection to next adult
                                document.getElementById(`control_${current_passenger}`).classList.remove('current');
                                document.getElementById(`control_${next_passenger}`).classList.add('current');
                            }
                            let cspan_div = document.getElementById(`cspan_${current_passenger}`);
                            cspan_div.classList.add(seat_div.id);
                            remove_classList(cspan_div); // check classlist and remove class
                            // create delete button
                            let del_div = document.createElement('div');
                            del_div.classList = 'del_div';
                            document.getElementById(`cspan_${current_passenger}`).innerHTML = 
                            `<div class="seat_num">${seat_div.id}</div>`;
                            document.getElementById(`cspan_${current_passenger}`).append(del_div);
                            del_div.onclick =()=>{ // delete seat on click
                                delete_seats(seat_div, current_passenger);
                                seat_div.classList.remove('occupied');
                            }
                            // show seats in outbound flight details
                            let outbound_current = document.getElementById(`outbound_${current_passenger}`);
                            outbound_current.classList.add(seat_div.id);
                            remove_classList(outbound_current);
                            document.getElementById(`outbound_${current_passenger}`).innerHTML = `
                            <div class="band">${priceband} seat ${seat_div.id}</div>
                            <div class="price">${price}</div>
                            `;
                            total += price;
                            document.getElementById('basketTotal').innerText = total.toFixed(2);
                            document.getElementById('skip-btn').innerHTML = change_btn(numberPassengers);
                            document.getElementById('skip_btn').innerHTML = change_btn(numberPassengers);
                            show_select_text();
                        } //if occupied end
                    } // seat_div onclick end
                } // check seat_div end
            } // seat end
        } // blocks end
    } // row end
    let tail = document.createElement('div');
    tail.className = "tail";
    document.getElementById('center').append(tail);
} // body onload end

// create functions to use next time
function split_number(seat_num){
    return seat_num.split('_')[1];
}
// remove previous class list
function remove_classList(cl){
    if (cl.classList.length > 2){
        let last = cl.classList[cl.classList.length-2]
        cl.classList.remove(last);
    }
}
// remove seats
function delete_seats(seat_div, current_passenger){
    let cspan = document.querySelectorAll('.cspan'); // get all cspan for adults
    for (let s of cspan.values()){
        if (s.classList.contains(seat_div.id)){
            s.innerHTML = "";
            s.classList.remove(seat_div.id);
            control = document.getElementById(`control_${current_passenger}`);
            if (control.classList.contains('current')){
                document.getElementById(`control_${current_passenger}`).classList.remove('current'); // remove current
                document.getElementById(`control_${split_number(s.id)}`).classList.add('current'); // move cursor to current
            }
            document.getElementById(`control_${split_number(s.id)}`).classList.remove(seat_div.id);
        }
    }
    // remove outbound flight seat
    let seat = document.querySelectorAll('.seats'); // get all seats from outbound flight
    for (let se of seat.values()){
        if (se.classList.contains(seat_div.id)){
            se.innerHTML = "-";
            se.classList.remove(seat_div.id);
        }
    }
    document.getElementById('skip-btn').innerHTML = change_btn();
    document.getElementById('skip_btn').innerHTML = change_btn();
}
// change continue when all seats are selected.
function change_btn(numberPassengers){
    let occupy = document.querySelectorAll('.occupied');
    if (occupy.length == numberPassengers){
        return "Continue";
    }
    else{
        return "Skip seats >";
    }
}
// text changes after seat selection
function show_select_text(){
    let checkselected = document.querySelectorAll('.occupied');
    if (checkselected.length == 0){
        document.getElementById('flight-info').innerHTML = "Please select a seat";
    }
    else{
        document.getElementById('flight-info').innerHTML = "Seat selected";
    }
}
// convert and format date
function get_date_time(sdate){
    sdate = new Date(sdate);
    let setdate = sdate.toString().split(' ').slice(0,3).join('-');
    let settime = sdate.toString().split(' ')[4];
    let newtime = settime.split(':').slice(0,2).join(':');
    return `${newtime} <b>${setdate}</b>`;
}
function rPriceing(seats, rPrice, rPlace){
    for (let r = 0; r < seats.Rows.length; r++) {
        for (let b = 0; b < seats.Rows[r].Blocks.length; b++) {
            for (let s = 0; s < seats.Rows[r].Blocks[b].Seats.length; s++) {
                seatPrice =seats.Rows[r].Blocks[b].Seats[s].Price;
                let priceband = seats.Rows[r].Blocks[b].Seats[s].PriceBand; // set price band
                (priceband == 0) ? priceband = "Regular" : priceband;
                rPrice.set(r, `${seatPrice} ${priceband}`);
            }
        }
    }
    for (let index = 0; index < rPrice.size; index++) {
        const element = rPrice.get(index);
        if(!rPlace.has(element)){
            rPlace.set(element,index);
        }
    }
}
// expand and close when basket is clicked
let flag = 1;
document.getElementById('basket').onclick =()=>{
    if (flag == 1){
        document.getElementById("rhs").style.width = "30%";
        flag = 0;
    }
    else{
        document.getElementById("rhs").style.width = "0";
        flag = 1;
    }
}
document.getElementById("close").onclick = ()=>{
    document.getElementById("rhs").style.width = "0";
    flag = 1;
}

