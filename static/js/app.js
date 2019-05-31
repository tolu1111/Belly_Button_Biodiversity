function buildMetadata(sample) {
 // Using `d3.json` to fetch the metadata for a sample

  d3.json(`/metadata/${sample}`).then(function(sampleData) {
    console.log(sampleData);
    
    // Using d3 to select the panel with id of `#sample-metadata`
    var panelData = d3.select("#sample-metadata");
    
    // Using `.html("") to clear any existing metadata
    panelData.html("");
    
    // Using `Object.entries` to add each key and value pair to the panel
    // Using d3 to append new tags for each key-value in the metadata.
    Object.entries(sampleData).forEach(([key, value]) => {
      panelData.append('h6').text(`${key}: ${value}`);
    })
    
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    var level = sampleData.WFREQ;

    // Trig to calc meter point
    var degrees = 180 - (level*20),
         radius = .7;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    
    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
         pathX = String(x),
         space = ' ',
         pathY = String(y),
         pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    
    var data = [{ type: 'scatter',
       x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'},
      { values: [45/8, 45/8, 45/8, 45/8, 45/8, 45/8, 45/8, 45/8, 45/8, 50],
      rotation: 90,
      text: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3',
                '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['#84B589','rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                             'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                             'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                             '#F4F1E4','#F8F3EC', 'rgba(255, 255, 255, 0)',]},
      labels: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3',
      '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];
    
    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],

      title: '<b>Belly Button Wash Frequency</b> <br>Scrub Per Week</br>',
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]}
    };
    Plotly.newPlot('gauge', data, layout);

    })
  }
  


function buildCharts(sample) {

 d3.json(`/samples/${sample}`).then(function (sampleData) {
  console.log(sampleData);
  // console.log(sampleData.otu_ids);
  // console.log(sampleData.otu_labels);
  // console.log(sampleData.sample_values);

  let otu_ids = sampleData.otu_ids;
  let otu_labels = sampleData.otu_labels;
  let sample_values = sampleData.sample_values;

  //Building Bubble chart
  var bubblePlotData = [{
    x: otu_ids,
    y: sample_values,
    text: otu_labels,
    mode: 'markers',
    marker: {
      size: sample_values,
      color: otu_ids,
      colorscale: 'Earth'
    }
  }];      

  var Layout = {
    title: "Belly Button Bubble Plot",
    margin: { t: 0 },
    hovermode: 'closest',
    xaxis: {title: 'OTU ID'},
  };

  Plotly.newPlot('bubble', bubblePlotData, Layout);

  // Building Pie Chart

  var piePlotData = [{
    values: sample_values.slice(0,10),
    labels: otu_ids.slice(0,10),
    hovertext: otu_labels.slice(0,10),
    // hoverinfo: 'hovertext',
    type: 'pie'
  }];

  var piePlotLayout = {
    title: "<b> Belly Button Pie Chart </b>",
    plot_bgcolor: 'rgba(0, 0, 0, 0,)',
    paper_bgcolor: 'rgba(0, 0, 0, 0,)',
  };

  Plotly.newPlot('pie', piePlotData, piePlotLayout); 

});
}

  

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
