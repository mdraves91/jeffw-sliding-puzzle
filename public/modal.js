document.addEventListener('DOMContentLoaded', () => {
    /****************************************************************************
     * DOM ELEMENTS
     ****************************************************************************/
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    document.getElementById('rules-btn').addEventListener('click', () => openModal('rules'));
    document.getElementById('about-btn').addEventListener('click', () => openModal('about'));
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    
    /******************************************************************************
     * MODAL CONTENT
     ******************************************************************************/
    const MODAL_CONTENT = {
        rules: {
            title: 'How to Play',
            content: `
                <p>Welcome to Color Slide Puzzle! Here's how to play:</p>
                <ol>
                    <li>Click on a colored tile next to the empty space to move it.</li>
                    <li>Arrange the tiles to match the targes, shown by the borders.</li>
                    <li>You can only move tiles horizontally or vertically.</li>
                    <li>The middle column can only be moved horizontally.</li>
                    <li>Complete the puzzle in as few moves as possible!</li>
                </ol>
                <p>The challenge edition also shuffles the target square colors each time.</p>
                <p>Good luck and have fun!</p>
            `
        },
        about: {
            title: 'About Color Slide Puzzle',
            content: `
                <p>This is a web implementation of Jeffw's shell puzzle, from the level Risky Riches, from the SMW Hack <a href="https://www.smwcentral.net/?p=section&a=details&id=40631/" target="_blank">Really Neat Gimmicks</a>.</p>
                <p>Original created by <a href="https://github.com/Gikkman" target="_blank">Gikkman</a>. Playable at <a href="https://jeffw.gikkman.com/" target="_blank">https://jeffw.gikkman.com/</a>. Source available on <a href="https://github.com/Gikkman/jeffw-sliding-puzzle" target="_blank">GitHub</a>.</p>
                <p>Challenge edition by <a href="https://github.com/mdraves91" target="_blank">mdraves91</a>. Source available on <a href="https://github.com/mdraves91/jeffw-sliding-puzzle" target="_blank">GitHub</a>.</p>
                <p>License: <a href="https://github.com/Gikkman/jeffw-sliding-puzzle/blob/main/LICENSE" target="_blank">MIT</a></p>
            `
        }
    };

    /******************************************************************************
     * MODAL LOGIC
     ******************************************************************************/
    function openModal(type) {
        if (MODAL_CONTENT[type]) {
            modalTitle.textContent = MODAL_CONTENT[type].title;
            modalBody.innerHTML = MODAL_CONTENT[type].content;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});