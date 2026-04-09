

const committee = document.getElementById('committee');
const musicianDiv = document.getElementById('musician_fields');

if (committee) {
    committee.onchange = function() {
        if (this.value === 'musician') {
            musicianDiv.style.display = 'block';
        } else {
            musicianDiv.style.display = 'none';
        }
    };
}

const form = document.querySelector('form');

if (form) {
    form.onsubmit = function(e) {
        e.preventDefault();
        
    
        let name = document.getElementById('fullname').value;
        let studentId = document.getElementById('student_id').value;
        let year = document.getElementById('year').value;
        let committeeVal = document.getElementById('committee').value;
        let major = document.getElementById('major').value;
        let instrument = document.getElementById('instrument') ? document.getElementById('instrument').value : '';
        let hear = document.getElementById('hear_about').value;
        let reason = document.getElementById('reason').value;
        let email = document.getElementById('email').value;
        
    
        if (!name || !studentId || !year || !committeeVal || !major || !hear || !reason || !email) {
            alert('Please fill all required fields.');
            return;
        }
        

        if (committeeVal === 'musician' && !instrument) {
            alert('Please tell us what instrument you play.');
            return;
        }
        
    
        if (reason.length < 20) {
            alert('Please write at least 20 characters explaining why you want to join.');
            return;
        }
        
     
        if (!email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        

        let msg = 'Application Submitted!\n\n';
        msg += 'Name: ' + name + '\n';
        msg += 'Student ID: ' + studentId + '\n';
        msg += 'Year: ' + year + '\n';
        msg += 'Committee: ' + committeeVal + '\n';
        msg += 'Major: ' + major + '\n';
        if (committeeVal === 'musician') {
            msg += 'Instrument: ' + instrument + '\n';
        }
        msg += 'Email: ' + email + '\n\n';
        msg += 'The admin will review your application.';
        
        alert(msg);
     
    };
}


const resetBtn = document.querySelector('button[type="reset"]');
if (resetBtn) {
    resetBtn.onclick = function() {
        let confirmReset = confirm('Reset all fields?');
        if (!confirmReset) {
            return false;
        }
    };
}