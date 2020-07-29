const Header = ()=>(
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark" style={{ marginBottom: '15px' }}>
    <a class="navbar-brand" href="#a">Meet</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarColor02">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <a class="nav-link" href="#a">Home <span class="sr-only">(current)</span></a>
        </li>
      </ul>
    </div>
  </nav>
)

window.Header = Header
