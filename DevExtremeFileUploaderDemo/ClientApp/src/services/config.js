export const getConfig = () => {
  //console.log(process.env);
  if (process.env.NODE_ENV === 'development')
    return ({ apiUrl: 'https://localhost:5001/' });

  const url = `${window.location.origin}/`;
  return ({ apiUrl: url });
}