 
const ContactUs = () => {
  const style = {
    backgroundColor: '#333',
    color: 'white',
    padding: '2rem',
    minHeight: '80vh',
  };

  return (
    <div style={style}>
      <h1>Contact Us</h1>
      <p>
        We welcome your feedback and reviews for the CodeReviewAI website.
      </p>
      <p>
        Please feel free to reach out to us via email or phone:
      </p>
      <ul>
        <li>Email: <a href="mailto:nomaantalibibm@gmail.com" style={{color: 'white'}} >nomaantalibibm@gmail.com</a></li>
        <li>Phone: <a href="tel:+917068604832" style={{color: 'white'}} >7068604832</a></li>
      </ul>
    </div>
  );
};

export default ContactUs;
