import { useEffect, useState } from 'react';
import {
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';

const BASE_URL: string = 'http://localhost:8000/api/';

interface Patron {
  id: number;
  alcohol_saturation_level: number;
  name: string;
  body_mass: number;
}

const Home = () => {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newPatronName, setNewPatronName] = useState('');
  const [newPatronBodyMass, setNewPatronBodyMass] = useState('');
  const [drinkId, setDrinkId] = useState('');

  useEffect(() => {
    fetchPatrons();
  }, []);

  const fetchPatrons = () => {
    fetch(`${BASE_URL}patrons`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch patrons');
        }
      })
      .then((data) => {
        setPatrons(data);
      })
      .catch((error) => {
        console.error('Failed to fetch patrons:', error);
        setErrorMessage('Failed to fetch patrons');
      });
  };

  const getColor = (saturationLevel: number): string => {
    if (saturationLevel > 0.8) {
      return 'red';
    } else if (saturationLevel > 0.5) {
      return 'orange';
    } else if (saturationLevel > 0.3) {
      return 'yellow';
    }
    return 'green';
  };

  const fetchSaturationLevel = (patronId: number) => {
    fetch(`${BASE_URL}patrons/${patronId}/get_alcohol_saturation_level`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to fetch saturation level for patron ${patronId}`);
        }
      })
      .then((data) => {
        const updatedPatrons = patrons.map((patron) => {
          if (patron.id === patronId) {
            return { ...patron, alcohol_saturation_level: data.alcohol_saturation_level };
          }
          return patron;
        });
        setPatrons(updatedPatrons);
        setSuccessMessage(`Saturation level fetched successfully for patron ${patronId}`);
      })
      .catch((error) => {
        console.error(`Failed to fetch saturation level for patron ${patronId}:`, error);
        setErrorMessage(`Failed to fetch saturation level for patron ${patronId}`);
      });
  };

  const addDrinkToPatronTally = (patronId: number) => {
    fetch(`${BASE_URL}patrons/add_drink/${patronId}/${drinkId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          fetchSaturationLevel(patronId);
        } else {
          throw new Error(`Failed to add drink to patron tally for patron ${patronId}`);
        }
      })
      .catch((error) => {
        console.error(`Failed to add drink to patron tally for patron ${patronId}:`, error);
        setErrorMessage(`Failed to add drink to patron tally for patron ${patronId}`);
      });
  };

  const addPatron = () => {
    fetch(`${BASE_URL}patrons/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newPatronName,
        body_mass: Number(newPatronBodyMass),
        alcohol_saturation_level: 0.0,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to add patron');
        }
      })
      .then((data) => {
        setPatrons((prevPatrons) => [...prevPatrons, data]);
        setSuccessMessage('Patron added successfully');
        setNewPatronName('');
        setNewPatronBodyMass('');
      })
      .catch((error) => {
        console.error('Failed to add patron:', error);
        setErrorMessage('Failed to add patron');
      });
  };

  const deletePatron = (patronId: number) => {
    fetch(`${BASE_URL}patrons/${patronId}/`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          const updatedPatrons = patrons.filter((patron) => patron.id !== patronId);
          setPatrons(updatedPatrons);
          setSuccessMessage(`Patron ${patronId} deleted successfully`);
        } else {
          throw new Error(`Failed to delete patron ${patronId}`);
        }
      })
      .catch((error) => {
        console.error(`Failed to delete patron ${patronId}:`, error);
        setErrorMessage(`Failed to delete patron ${patronId}`);
      });
  };

  return (
    <Container>
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          <AlertTitle>Success</AlertTitle>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          <AlertTitle>Error</AlertTitle>
          {errorMessage}
        </Alert>
      )}
      <Typography variant="h4" component="h1" align="center">
        Patron Tally
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Body Mass</TableCell>
            <TableCell>Alcohol Saturation Level</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patrons.map((patron) => (
            <TableRow key={patron.id} style={{ backgroundColor: getColor(patron.alcohol_saturation_level) }}>
              <TableCell>{patron.name}</TableCell>
              <TableCell>{patron.body_mass}</TableCell>
              <TableCell>{patron.alcohol_saturation_level}</TableCell>
              <TableCell>
                <Button variant="outlined" onClick={() => fetchSaturationLevel(patron.id)}>
                  Update Saturation Level
                </Button>
                <Button variant="outlined" onClick={() => deletePatron(patron.id)}>
                  Delete
                </Button>
                <TextField
                  label="Drink ID"
                  value={drinkId}
                  onChange={(e) => setDrinkId(e.target.value)}
                  style={{ marginLeft: '1rem' }}
                />
                <Button variant="outlined" onClick={() => addDrinkToPatronTally(patron.id)}>
                  Add Drink
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h5" component="h2" align="center" style={{ marginTop: '2rem' }}>
        Add Patron
      </Typography>
      <form onSubmit={addPatron}>
        <TextField
          label="Name"
          required
          value={newPatronName}
          onChange={(e) => setNewPatronName(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <TextField
          label="Body Mass"
          required
          value={newPatronBodyMass}
          onChange={(e) => setNewPatronBodyMass(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <Button variant="contained" type="submit">
          Add
        </Button>
      </form>
    </Container>
  );
};

export default Home;
