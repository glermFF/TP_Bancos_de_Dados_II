import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AuthCard, authStyles } from '../../components/AuthCard';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { useAuth } from '../../context/AuthContext';
import { apiErrorMessage } from '../../services/api';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const nav = useNavigation<Nav>();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setError(null);
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }
    setBusy(true);
    try {
      await signUp({ name, username, email, password });
      nav.navigate('Home');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen active="SignUp">
      <AuthCard
        docLabel="DOC. Nº 02 — REGISTRO DE NOVO VIAJANTE"
        title={<>Tire sua carteirinha de viajante.</>}
        subtitle="Uma carteirinha, todas as estradas: salve rotas, registre notas de campo e ganhe reputação pelo caminho."
      >
        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        <Field label="Nome completo" placeholder="Maria da Estrada" value={name} onChangeText={setName} />
        <Field
          label="Usuário"
          hint="3–24 CARACTERES · A–Z 0–9 _ . -"
          placeholder="maria.estrada"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Field
          label="E-mail"
          placeholder="maria@exemplo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label="Senha"
          hint="MÍN. 6 CARACTERES"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Field
          label="Confirmar senha"
          placeholder="••••••••"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          onSubmitEditing={submit}
        />
        <Button label={busy ? 'Carimbando…' : 'Criar conta'} full disabled={busy} onPress={submit} />
        <View style={authStyles.switchRow}>
          <Text style={authStyles.switchText}>Já tem a carteirinha?</Text>
          <Hoverable onPress={() => nav.navigate('SignIn')}>
            <Text style={authStyles.switchLink}>Entrar →</Text>
          </Hoverable>
        </View>
      </AuthCard>
    </Screen>
  );
}
