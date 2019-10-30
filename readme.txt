To excute the code, need to run the below command : 

    npm run dev

This parses the data file on the initial main API endpoint call and saves data to node-cache for the given time.  
On subsequent calls, will fetch data from the node-cache untill the server restarts or the cache expires.

Main API endpoint: 
    http://localhost:8080/api/packages

    - Lists all the installed packages ordered alphabetically.
    - Displays 10 records on every page.
    - Gives href for each package to check more details.
    - Gives links to navigate to first, next and previous page.

    http://localhost:8080/api/packages/:packagename

    - Gives details like name, version, description, list of the packges on which this 
      packge depends (named as depends in response) and
      list of the packages which are dependent on this package (named as packagesDependingOnMe in response).
    - Link to the list of packages endpoint.

