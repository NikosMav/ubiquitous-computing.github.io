document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('[data-section-name]');
  const stickyTag = document.getElementById('sticky-tag');

  function findActiveSections(element, result = []) {
    if (!element) return result;

    if (element.hasAttribute('data-section-name')) {
      result.unshift({name: element.getAttribute('data-section-name'), element: element});
    }

    return findActiveSections(element.parentElement, result);
  }

  function scrollToSection(event) {
    const sectionId = event.currentTarget.getAttribute('data-target-id');
    const section = document.querySelector(`[data-section-name="${sectionId}"]`);
    if (section) {
      section.scrollIntoView({behavior: 'smooth'});
    }
  }

  function updateStickyTag() {
    stickyTag.innerHTML = ''; // clear the previous content
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const rect = section.getBoundingClientRect();

      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        const activeSections = findActiveSections(section);
        if (activeSections.length > 0) {
          activeSections.forEach((sec, index) => {
            const breadcrumb = document.createElement('a');
            breadcrumb.textContent = sec.name;
            breadcrumb.setAttribute('href', '#'); // Prevent the default navigation behavior
            breadcrumb.setAttribute('data-target-id', sec.name);
            breadcrumb.addEventListener('click', function(e) {
              e.preventDefault();
              scrollToSection(e);
            });

            stickyTag.appendChild(breadcrumb);

            // If it's not the last breadcrumb, append '>'
            if (index !== activeSections.length - 1) {
              stickyTag.appendChild(document.createTextNode(' > '));
            }
          });
          stickyTag.style.display = 'block';
          return;
        }
      }
    }

    // Hide the sticky tag if no section is active
    stickyTag.style.display = 'none';
  }

  window.addEventListener('scroll', updateStickyTag);
  window.addEventListener('resize', updateStickyTag);

  // Initial update
  updateStickyTag();
});



