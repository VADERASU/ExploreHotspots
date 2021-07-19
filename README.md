# Exploring Geographic Hotspots Using Topological Data Analysis
The project introduces a scalar field topology (SFT)-based visual analytics framework for the interactive characterization and analysis of hotspots within kernel density estimate derived from point events. The visual analytics system supports the analyst and demonstrates the merit of the proposed framework on two crime datasets, Chicago gang crime data and Purdue general crime data. 

## Configuration
Frontend(Nodejs) <=> Middleware(Paraview) <=> Backend(TTK)\
Nodejs Version: v10.19.0\
Paraview: pv5.8\
TTK: The Topology ToolKit 

## Data
The Seattle general crime data are processed to the vtk format, which can be loaded by ParaView. They are uploaded to google drive.
Please download them at https://drive.google.com/drive/folders/1nDPCVfWScWBt--owKqZBUTp3FLJ8j67V?usp=sharing

## Install
1> Download the repository(Frontend), and npm build, npm start to start the frontend.\
2> Download Paraview and TTK, configure them in your local computer. \
3> Load the state of TTK to run the system(Middleware and Backend). The states(ttkState4SeattleData.pvsm) are downloaded at google drive: https://drive.google.com/drive/folders/1nDPCVfWScWBt--owKqZBUTp3FLJ8j67V?usp=sharing

## Demo of case study
<a href="https://youtu.be/qUTTGwqafeI" target="_blank">Demo Video</a> provides Purdue general crime data case to introduce the usage of the system. 

## Contact Us
If have any problem when install or run the system, please contact us at rzhan100@asu.edu.
