import { MenuItem,FormControl,Select, Card, CardContent } from '@material-ui/core';
import React,{useState,useEffect} from 'react';
import './App.css';
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"

import {sortData,prettyPrintStat} from './util'



function App() {
const [countries, setCountries] = useState([]);
const [country, setCountry] = useState('worldwide');
const [countryInfo, setCountryInfo] = useState({})
const [tableData, setTableData] = useState([])
const [mapCenter, setMapCenter] = useState({lat:34.80746,lng:-40.4796})
const [mapZoom, setMapZoom] = useState(3);
const [casesType, setCasesType] = useState("cases");
const [mapCountries, setMapCountries] = useState([]);


useEffect(() => {
 fetch("https://disease.sh/v3/covid-19/all")
 .then(response=>response.json())
 .then(data=>{
   setCountryInfo(data)
   console.log(data)
 })
}, [])

useEffect(() => {
  const getCountriesData=async()=>{
    await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=>response.json())
    .then((data)=>{
      const countries=data.map((data)=>(
        {
          name:data.country,
          value:data.countryInfo.iso2
        }));

        const sortedData=sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
      setCountries(countries);
    })
  }

  getCountriesData();
}, [])

const onCountryChange=async (e)=>{
  const countryCode=e.target.value;
 

  const url= countryCode ==='worldwide'?'https://disease.sh/v3/covid-19/all':`https://disease.sh/v3/covid-19/countries/${countryCode}`

  await fetch(url)
  .then(response=>response.json())
  .then(data=>{

    if(data){
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    }
    

    setCountry(countryCode)
    setCountryInfo(data);

    setMapZoom(4);
    
   
  })
}

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
        <h1>COVID-19 TRACKER</h1>
        <FormControl className="app__dropdown">
          <Select variant="outlined" onChange={onCountryChange} value={country}>
          <MenuItem value="worldwide">WorldWide</MenuItem>
            {countries.map((country)=> <MenuItem 
            value={country.value}>{country.name}</MenuItem>)}
          </Select>
        </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox isRed
           active={casesType==='cases'}
           onClick={e=>setCasesType('cases')}
           title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox active={casesType==='recovered'}
           onClick={e=>setCasesType('recovered')}
           title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox isRed
           active={casesType==='deaths'}
           onClick={e=>setCasesType('deaths')}
           title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
        </div>

        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>

      <Card className="app__right">
        <CardContent>
          <div className="app__information">
          <h3>Live cases by country</h3>
          <Table countries={tableData}/>
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph  className="app__graph" casesType={casesType} />
          </div>
          
        </CardContent>

      </Card>
      
    </div>
  );
}

export default App;
