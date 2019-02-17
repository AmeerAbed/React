import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import marked from 'marked';

const API_PREFIX_URL = 'http://localhost:4000/api/pages';

class ShowPage extends Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true, error: null };
  }

  getSlug() {
    if (this.props.match.params.slug) {
      return this.props.match.params.slug;
    } else {
      return 'index';
    }
  }

  async componentDidMount() {
    const slug = this.getSlug();
    const res = await fetch(`${API_PREFIX_URL}/${slug}`);
    const json = await res.json();
    if (json.status === 'ok') {
      this.setState({ page: json.page, isLoading: false });
    } else if (json.status === 'error') {
      this.setState({ error: json.error, isLoading: false });
    } else {
      this.setState({ error: 'Unknown error', isLoading: false });
    }
  }

  render() {
    const slug = this.getSlug();
    const { isLoading, page, error } = this.state;
    if (isLoading) { return <p className="loading">Loading...</p> };
    if (error) { return <p className="error">{ error }</p> };
    const html = { __html: marked(page.body) };
    return (
      <div className="page">
        <h1>{ page.title }</h1>
        <div className="content" dangerouslySetInnerHTML={html} />
        <div className="page__actions">
          <Link to={`edit/${slug}`}>Edit Page</Link>
        </div>
      </div>
     );
  }
}

class EditPage extends Component {

  constructor(props) {
    super(props);
    this.state = { isLoading: true, error: null, isSaved: false };
    this.handleChange = this.handleChange.bind(this);
  }

  getSlug() {
    if (this.props.match.params.slug) {
      return this.props.match.params.slug;
    } else {
      return 'index';
    }
  }

  async componentDidMount() {
    const slug = this.props.match.params.slug;
    const res = await fetch(`${API_PREFIX_URL}/${slug}`);
    const json = await res.json();
    if (json.status === 'ok') {
      this.setState({ page: json.page, isLoading: false });
    } else if (json.status === 'error') {
      this.setState({ error: json.error, isLoading: false });
    } else {
      this.setState({ error: 'Unknown error', isLoading: false });
    }
  }

  handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    const page = JSON.parse(JSON.stringify(this.state.page));
    page[name] = value;
    this.setState({ page });
  }

  async onSubmit() {
    const slug = this.getSlug();
    const res = await fetch(`${API_PREFIX_URL}/${slug}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.page)
    });
    const json = await res.json();
    this.setState({ isSaved: true });
  }

  render() {
    const slug = this.getSlug();
    const { page, isLoading, error, isSaved } = this.state;
    if (isLoading) { return <div className="loader">Loading...</div> };
    if (error) { return <p className="error">{ error }</p> };
    if (isSaved) { return <Redirect to={`/${slug}`} /> }
    return (
      <div className="edit">
        <div className="edit__row">
          <label>
            <span className="edit__label">Title</span>
            <input className="edit__text" type="text" name="title" value={ page.title } onChange={this.handleChange} placeholder="About Us" />
           </label>
        </div>
        <div className="edit__row">
          <label>
            <span className="edit__label">Body</span>
            <textarea className="edit__textarea" name="body" value={ page.body } onChange={this.handleChange} placeholder="Welcome to ACME, Inc." />
            <div className="edit__help">Pages are written using <a href="https://commonmark.org/help/" target="_blank">Markdown</a>.</div>
           </label>
        </div>
        <div className="edit__row">
          <button onClick={ this.onSubmit.bind(this) } title="Save">Save</button>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <div className="app">
          <header>
            <h1>ACME Inc</h1>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
            </nav>
          </header>
          <main>
           <Route path="/edit/:slug" component={EditPage} />
           <Route exact path="/:slug" component={ShowPage} />
           <Route exact path="/" component={ShowPage} />
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
