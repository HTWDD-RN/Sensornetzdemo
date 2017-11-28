package main;

# forward declaration
sub WSNPHD_Initialize($);
sub WSNPHD_Define($$);
sub WSNPHD_Ready($);
sub WSNPHD_Read($);
sub WSNPHD_Write($$);
sub WSNPHD_Get($@);
sub WSNPHD_Set($@);
sub WSNPHD_Parse($$);
sub WSNPHD_InitComm($);

# Verbindungsinformationen zum CoAP-Client
# werden vom define ueberschrieben
my $coap_cl_port = "50009";
my $coap_cl_ip   = "localhost";

my %discover_requests;

# Enthaelt alle moeglichen get-Befehle fuer das WSNPHD-Geraet
my %gets = (    # Name, Data to send to the CUL, Regexp for the answer
	"discover"   => ""
);

# Enthaelt alle moeglichen set-Befehle fuer das WSNPHD-Geraet
my %sets = (
	"wsnPair" => "",
	"client" => ""
);

###############################################################
# WSNPHD_Initialize
#
# Wird von FHEM gerufen, sobald das Modul geladen wird (einmalig)
# Die Modul-Funktionen werden FHEM bekannt gegeben.
###############################################################
sub WSNPHD_Initialize($) {

	my ($hash) = @_;	    
	require "$attr{global}{modpath}/FHEM/DevIo.pm";
  
	$hash->{ReadFn}  = "WSNPHD_Read";
	$hash->{WriteFn} = "WSNPHD_Write";
	$hash->{ReadyFn} = "WSNPHD_Ready";
	$hash->{GetFn}   = "WSNPHD_Get";
	$hash->{SetFn}   = "WSNPHD_Set";
	$hash->{DefFn}   = "WSNPHD_Define";	
  $hash->{AttrList}  = "loglevel:0,1,2,3,4,5,6 setList";
    
  # definieren aller logischen Module, die WSNPHD nutzen duerfen
	$hash->{Clients} = ":WSN:";
	
	# zum matchen
	my %mc = (
		"1:WSN"   => "^WSN.*",
	);
	$hash->{MatchList} = \%mc;
}

###############################################################
# WSNPHD_Define
#
# wird von FHEM gerufen, sobald ein neues Geraet angelegt wurde.
# Es wird geprueft, ob die Anzahl der Parameter stimmt. Ausserdem
# werden die Eigenschaften des neuen FHEM-Geraetes gesetzt.
###############################################################
sub WSNPHD_Define($$) {

	Log(3, "WSNPHD_Define called");
	my ($hash, $def) = @_;
	my @a = split("[ \t][ \t]*", $def);
	
	# Parameteranzahl pruefen
	if(@a != 3) {
		my $msg = "wrong syntax: define <name> WSNPHD ip[:port]";
		Log(2, $msg);
		return $msg;
	}
	
	# Verbindung zum CoAP-Client trennen
	DevIo_CloseDev($hash);

	my $name = $a[0];
	my $dev = $a[2];
	
	# Falls kein Port angegeben wurde, dann default 50009
	$dev .= ":50009" if($dev !~ m/:/);
	$attr{$name}{hmId} = sprintf("%06X", time() % 0xffffff); # wird vermutlich nicht benoetigt
	
	if($dev eq "none") {
		Log(1, "$name device is none, commands will be echoed only");
		$attr{$name}{dummy} = 1;
		return undef;
	}
	
	# setzen der Geraetattribute
	my $ip_port = $dev;
	my @t = split(":", $ip_port);
	
	$hash->{IP} = $t[0];
	$hash->{PORT} = $t[1];
	
	$hash->{DeviceName} = $dev;
	
	# Verbindung zum CoAP-Client aufbauen (verwendet devio-Modul) 
	my $ret = DevIo_OpenDev($hash, 0, "WSNPHD_InitComm");
	return $ret;	
}
###############################################################
# WSNPHD_Read
#
# Wenn Daten bereitstehen wird diese Funktion von FHEM gerufen.
# Anschliessend werden die Daten auf dem Puffer gelesen und der
# Parse-Funktion uebergeben.
###############################################################
sub WSNPHD_Read($) {
	
	Log(3, "WSNPHD_Read called");
	# called from the global loop, when the select for hash->{FD} reports data
	my ($hash) = @_;

	my $buf = DevIo_SimpleRead($hash);  # get message buffer from coap client
	return "" if(!defined($buf));

	my $name = $hash->{NAME};
	my $ll5 = GetLogLevel($name,5);
  
	my $hmdata = $hash->{PARTIAL};
	Log $ll5, "WSN/RAW: $hmdata/$buf" if (!$debug);
	$hmdata .= $buf;
	
	while($hmdata =~ m/\n/) { # process every single message from message buffer
		my $rmsg;

		($rmsg,$hmdata) = split("\n", $hmdata, 2);
		$rmsg =~ s/\r//;
		
		# Parse die Nachricht
		WSNPHD_Parse($hash, $rmsg) if($rmsg);
	}
	$hash->{PARTIAL} = $hmdata;	
}

###############################################################
# WSNPHD_Write
#
# Wenn ein WSN-Geraet oder eine WSNPHD-Funktion Daten per Socket
# senden moechten, wird diese Funktion gerufen.
###############################################################
sub WSNPHD_Write($$) {
	
	Log(3, "WSNPHD_Write called");
	my ($hash,$msg) = @_;

	#Log 3, $hash->{NAME} . "InWrite ::" .$hash->{TCPDev};
	
	# Nachricht in Socket schreiben	
	syswrite($hash->{TCPDev}, $msg)     if($hash->{TCPDev});
}

###############################################################
# WSNPHD_Ready
#
# Versucht die Verbindung zum CoAP-Client wiederherzustellen,
# falls diese unterbrochen worde
###############################################################
sub WSNPHD_Ready($) {
	
	# TODO: reopen connection if lost
	my ($hash) = @_;
	
	#Log 3, $hash->{NAME} . "InReady";

	return DevIo_OpenDev($hash, 1, "WSNPHD_InitComm")
		if($hash->{STATE} eq "disconnected");
}

###############################################################
# WSNPHD_Get
#
# Wird verwendet, um "globale Befehle" an CoAP-Server zu schicken.
# Momentan wird hier nur das discover gehandhabt.
###############################################################
sub WSNPHD_Get($@) {
	
	Log(3, "WSNPHD_Get called");
	my ($hash, @a) = @_;
	my $type = $hash->{TYPE};
	
	# Pruefe die Argumente
	return "\"get $type\" needs at least one parameter" if(@a < 3);
	return "Unknown argument $a[1], choose one of " . join(" ", sort keys %gets)
	if(!defined($gets{$a[1]}));
	
	my $arg = ($a[2] ? $a[2] : "");
	my $name = $a[0];
	my $type = $a[1];
	my $uri  = $a[2];

  
	if($type eq "discover") {
		
		# baue Nachricht fuer CoAP-Client zusammen
		my $msg = "discover|".$uri."\n";
			
		# Speichert die abgesendete discovery-Anfrage, um spaeter
		# bei eingehenden Discovery-Antworten zu pruefen, ob diese
		# angefordert wurde.
		#$discover_requests{$msg} = 1;
		#Log 3, $hash->{NAME} . "WSNPHD disc: ". $msg;
				
		WSNPHD_Write($hash,$msg);	
	}
	 
	return "";
}

###############################################################
# WSNPHD_Set
#
# Wird verwendet, um "globale Befehle" an CoAP-Server zu schicken
# und Attribute des WSNPHD-Geraetes zu aendern.
# Momentan wird hier nur das discover(y) gehandhabt.
###############################################################
sub WSNPHD_Set($@) {
	 
	Log(3, "WSNPHD_Set called");
	my ($hash, @a) = @_;
	
	return "\"set WSNPHD\" needs at least one parameter" if(@a < 3);
	return "Unknown argument $a[1], choose one of " . join(" ", sort keys %sets)
	if(!defined($sets{$a[1]}));
		
	my $name = $a[0];
	my $type = $a[1];
	my $v  = $a[2];
		   
	if ($type eq "wsnPair") {
		# fuer zukuenftigen Pairing-Befehl
	}
	elsif ($type eq "client") { 
		# zum Aendern der IP und des Ports
		my $ip_port = $v;
		my @t = split(":", $ip_port);
				
		$hash->{IP} = $t[0];
		$hash->{PORT} = $t[1];
				
		#muesste noch im Geraet aktualisiert werden
		#$hash->{DeviceName} =  $t[0].":". $t[1];
		# wahrscheinlich auch DevIo open und close ausfuehren
				
		$coap_cl_ip = $t[0];
		$coap_cl_port = $t[1];
	}
		  
	return "";
}


###############################################################
# WSNPHD_Parse
#
# Wird von der WSNPHD_Read-Funktion gerufen
###############################################################
sub WSNPHD_Parse($$) {
  
	Log(3, "WSNPHD_Parse called");
	my ($hash, $rmsg) = @_;
	
	# concat 
	my $dmsg = "WSN" . $rmsg; 
	  
	# call dispatch for invoking right module func
	Dispatch($hash, $dmsg, undef);  
}

sub WSNPHD_InitComm($) {
  
}
